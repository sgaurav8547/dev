using System.Text;
using System.Text.RegularExpressions;
using Azure;
using Azure.AI.DocumentIntelligence; // NuGet: Azure.AI.DocumentIntelligence
using OpenAI.Chat;                   // NuGet: OpenAI
using Microsoft.ML.Tokenizers;       // NuGet: Microsoft.ML.Tokenizers
using HtmlAgilityPack;               // NuGet: HtmlAgilityPack

public class RagProcessor
{
    private readonly DocumentIntelligenceClient _azureClient;
    private readonly ChatClient _openAiClient;
    private readonly Tokenizer _tokenizer;
    private const int MaxTokens = 800;

    public RagProcessor(string azureEndpoint, string azureKey, string openAiKey)
    {
        _azureClient = new DocumentIntelligenceClient(new Uri(azureEndpoint), new AzureKeyCredential(azureKey));
        _openAiClient = new ChatClient(model: "gpt-4o-mini", openAiKey);
        _tokenizer = TiktokenTokenizer.CreateForModel("gpt-4o");
    }

    public async Task<List<string>> ProcessDocument(string filePath)
    {
        // 1. EXTRACTION & STRIPPING
        using var stream = new FileStream(filePath, FileMode.Open);
        var options = new AnalyzeDocumentOptions("prebuilt-layout", BinaryData.FromStream(stream)) { 
            OutputContentFormat = DocumentContentFormat.Markdown 
        };
        var poller = await _azureClient.AnalyzeDocumentAsync(WaitUntil.Completed, options);
        var result = poller.Value;

        // Use Offset-based stripping to remove headers/footers while keeping <table> intact
        string cleanMarkdown = StripNoiseByOffsets(result);

        // 2. SEMANTIC ANALYSIS (Step 2)
        var splitPoints = await GetSemanticSplitPoints(cleanMarkdown);

        // 3. PHYSICAL SLICING & TABLE HANDLING (Step 3 & Large Tables)
        var rawChunks = SliceText(cleanMarkdown, splitPoints);
        var finalChunks = new List<string>();

        foreach (var chunk in rawChunks)
        {
            if (_tokenizer.CountTokens(chunk) > MaxTokens && chunk.Contains("<table"))
            {
                // Recursive step: If a chunk is too big because of a table, split the table
                finalChunks.AddRange(SplitLargeTable(chunk));
            }
            else
            {
                finalChunks.Add(chunk);
            }
        }

        return finalChunks;
    }

    private string StripNoiseByOffsets(AnalyzeResult result)
    {
        var builder = new StringBuilder(result.Content);
        var noiseSpans = result.Paragraphs
            .Where(p => p.Role == ParagraphRole.PageHeader || p.Role == ParagraphRole.PageFooter || p.Role == ParagraphRole.PageNumber)
            .SelectMany(p => p.Spans)
            .OrderByDescending(s => s.Offset);

        foreach (var span in noiseSpans)
            builder.Remove(span.Offset, span.Length);

        return builder.ToString();
    }

    private async Task<List<string>> GetSemanticSplitPoints(string markdown)
    {
        ChatCompletionOptions options = new() { Temperature = 0f, ResponseFormat = ChatResponseFormat.CreateJsonResponse() };
        string prompt = "Return a JSON object { 'split_sentences': [] } containing the exact first sentence of every new topic shift. Do not change any text.";
        
        var completion = await _openAiClient.CompleteChatAsync([new SystemChatMessage(prompt), new UserChatMessage(markdown)], options);
        var json = JsonDocument.Parse(completion.Value.Content[0].Text);
        return json.RootElement.GetProperty("split_sentences").EnumerateArray().Select(x => x.GetString()).ToList();
    }

    private List<string> SliceText(string text, List<string> points)
    {
        var chunks = new List<string>();
        int lastIndex = 0;
        foreach (var p in points)
        {
            int idx = text.IndexOf(p, lastIndex);
            if (idx > lastIndex) {
                chunks.Add(text.Substring(lastIndex, idx - lastIndex).Trim());
                lastIndex = idx;
            }
        }
        chunks.Add(text.Substring(lastIndex).Trim());
        return chunks;
    }

    private List<string> SplitLargeTable(string chunk)
    {
        var html = new HtmlDocument();
        html.LoadHtml(chunk);
        var table = html.DocumentNode.SelectSingleNode("//table");
        if (table == null) return new List<string> { chunk };

        var header = table.SelectSingleNode(".//thead")?.OuterHtml ?? table.SelectSingleNode(".//tr")?.OuterHtml;
        var rows = table.SelectNodes(".//tr").Skip(1).ToList(); // Skip header row
        
        var results = new List<string>();
        for (int i = 0; i < rows.Count; i += 20) // Group 20 rows per chunk
        {
            var batch = rows.Skip(i).Take(20);
            results.Add($"<table>{header}{string.Concat(batch.Select(r => r.OuterHtml))}</table>");
        }
        return results;
    }
}
