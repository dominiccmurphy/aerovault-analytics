using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/airspace/[controller]")]
public class Airlines(NpgsqlDataSource dataSource) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? manufacturer)
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        // Run your Dapper conn.QueryAsync<AircraftModelDto>(...) here
        var records = await conn.QueryAsync<AirlineSnapshotDto>("SELECT * FROM vw_airline_snapshots;");
        return Ok(records);
    }
}