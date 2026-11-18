using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/[controller]")]
public class AircraftCommercialController(NpgsqlDataSource dataSource, ILogger<AircraftController> logger) : ControllerBase
{
    // CREATE: POST /api/items
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAircraftCommercialDto dto)
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        var created = await conn.QuerySingleAsync<AircraftModelDto>(
            @"INSERT INTO aircraft_commercial_specs (manufacturer_id, model_name, passenger_capacity, price_millions_usd)
              SELECT
                    md.manufacturer_id, 
                    md.model_name,
                    @PassengerCapacity,
                    @PriceMillionsUsd
              FROM
                aircraft_models AS md
              WHERE
                md.model_id=@Id
              RETURNING *;",
            new {Id=dto.ModelId, PassengerCapacity=dto.PassengerCapacity, PriceMillionsUsd=dto.PriceMillionsUsd}
        );
        return Ok(created);
    }

    // UPDATE: PUT /api/items/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAircraftCommercialDto dto)
    {
        await using var conn = await dataSource.OpenConnectionAsync();

        var updated = await conn.QueryFirstOrDefaultAsync<AircraftModelDto>(
            @"UPDATE aircraft_commercial_specs as c
              SET passenger_capacity=@PassengerCapacity,
                  price_millions_usd = @PriceMillionsUsd
              FROM
                aircraft_models md
              WHERE
                md.model_name=c.model_name
                AND md.model_id = @Id
              RETURNING *;",
            new { Id = id, dto.PassengerCapacity, dto.PriceMillionsUsd}
        );

        return updated is null ? NotFound() : Ok(updated);
    }

    // DELETE: DELETE /api/items/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var conn = await dataSource.OpenConnectionAsync();
        var rowsAffected = await conn.ExecuteAsync(
            @"DELETE FROM aircraft_commercial_specs AS c
                USING aircraft_models AS md
                WHERE md.model_name=c.model_name
                AND md.model_id = @Id;",
            new { Id = id }
        );

        return rowsAffected == 0 ? NotFound() : NoContent();
    }
}