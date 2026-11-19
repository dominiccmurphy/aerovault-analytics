public class AuditLogDto
{
    public int AuditId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string RecordKey { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime ChangedAt { get; set; }
}