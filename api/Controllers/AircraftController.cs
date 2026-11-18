using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/[controller]")]
public class AircraftController(NpgsqlDataSource dataSource, ILogger<AircraftController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? manufacturer)
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        // Run your Dapper conn.QueryAsync<AircraftModelDto>(...) here
        var records = await conn.QueryAsync<AircraftModelDto>(
            @"SELECT
                *
            FROM
                vw_aircraft_analytics
            WHERE
                (@Manufacturer::text IS NULL OR LOWER(manufacturer) = LOWER(@Manufacturer::text))
            ORDER BY
                manufacturer, model_name;
            ",
            new {Manufacturer=manufacturer}
        );
        return Ok(records);
    }
}