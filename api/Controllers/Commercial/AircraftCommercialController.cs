using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/[controller]")]
public class AircraftCommercialController(NpgsqlDataSource dataSource, ILogger<AircraftCommercialController> logger) : ControllerBase
{
    // CREATE: POST /api/aircraftcommercial
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAircraftCommercialDto dto)
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        await using var tx = await conn.BeginTransactionAsync();

        var rows = await conn.ExecuteAsync(
            @"INSERT INTO aircraft_commercial_specs (
                manufacturer_id, model_name, passenger_capacity, price_millions_usd
            )
            SELECT md.manufacturer_id, md.model_name, @PassengerCapacity, @PriceMillionsUsd
            FROM aircraft_models AS md
            WHERE md.model_id = @ModelId;",
            new { dto.ModelId, dto.PassengerCapacity, dto.PriceMillionsUsd },
            transaction: tx
        );

        if (rows == 0) return NotFound();

        var fullModel = await conn.QuerySingleAsync<AircraftModelDto>(
            "SELECT * FROM vw_aircraft_analytics WHERE model_id = @ModelId;",
            new { dto.ModelId },
            transaction: tx
        );

        await tx.CommitAsync();
        return Ok(fullModel);
    }

    // UPDATE: PUT /api/aircraftcommercial/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAircraftCommercialDto dto)
    {
        logger.LogInformation("PUT /api/aircraftcommercial/{Id}: {@Dto}", id, dto);
        await using var conn = await dataSource.OpenConnectionAsync();
        await using var tx = await conn.BeginTransactionAsync();

        var rows = await conn.ExecuteAsync(
            @"UPDATE aircraft_commercial_specs as c
              SET passenger_capacity=@PassengerCapacity,
                  price_millions_usd = @PriceMillionsUsd
              FROM
                aircraft_models md
              WHERE
                md.model_name=c.model_name
                AND md.manufacturer_id = c.manufacturer_id
                AND md.model_id = @Id;",
            new { Id = id, dto.PassengerCapacity, dto.PriceMillionsUsd},
            transaction: tx
        );

        if (rows == 0) return NotFound();

        var fullModel = await conn.QuerySingleAsync<AircraftModelDto>(
            "SELECT * FROM vw_aircraft_analytics WHERE model_id = @ModelId;",
            new { ModelId=id },
            transaction: tx
        );

        await tx.CommitAsync();
        return Ok(fullModel);
    }

    // DELETE: DELETE /api/aircraftcommercial/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        logger.LogInformation("DELETE /api/aircraftcommercial/{Id}", id);
        await using var conn = await dataSource.OpenConnectionAsync();

        var rowsAffected = await conn.ExecuteAsync(
            @"DELETE FROM aircraft_commercial_specs AS c
              USING aircraft_models AS md
              WHERE md.model_name = c.model_name
                AND md.manufacturer_id = c.manufacturer_id
                AND md.model_id = @Id;",
            new { Id = id }
        );

        return rowsAffected == 0 ? NotFound() : NoContent();
    }
}