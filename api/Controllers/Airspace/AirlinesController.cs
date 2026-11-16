using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/airspace/[controller]")]
public class Airlines(NpgsqlDataSource dataSource) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? date)
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        // Run your Dapper conn.QueryAsync<AircraftModelDto>(...) here
        var records = await conn.QueryAsync<AirlineSnapshotDto>(
            @"SELECT
                *
            FROM
                vw_airline_snapshots
            WHERE
                snapshot_date = COALESCE(@Date::date, (SELECT MAX(snapshot_date) FROM vw_country_snapshots))
            ORDER BY
                active_aircraft_count DESC;",
            new {Date=date}
        );
        return Ok(records);
    }
}