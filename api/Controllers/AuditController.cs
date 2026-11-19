using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/[controller]")]
public class AuditController(NpgsqlDataSource dataSource) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRecentLogs()
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        var logs = await conn.QueryAsync<AuditLogDto>(
            @"SELECT
                audit_id,
                table_name,
                record_key,
                action,
                old_values::text AS old_values,
                new_values::text AS new_values,
                changed_at
              FROM audit_logs
              ORDER BY changed_at DESC
              LIMIT 200;"
        );
        return Ok(logs);
    }
}