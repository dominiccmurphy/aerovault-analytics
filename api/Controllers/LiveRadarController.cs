using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Text.Json;
using System.Text.Json.Serialization;
using web_api.Models;

public class OpenSkyResponse
{
    [JsonPropertyName("time")]
    public long Time { get; set; }

    [JsonPropertyName("states")]
    public List<List<JsonElement>> States { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class LiveRadarController(IHttpClientFactory httpClientFactory, ILogger<LiveFlightDto> logger) : ControllerBase
{
    [HttpGet("stream")]
    public async Task<IActionResult> Get(
        [FromQuery] float? lamin,
        [FromQuery] float? lomin,
        [FromQuery] float? lamax,
        [FromQuery] float? lomax,
        CancellationToken cancellationToken)
    {
        if(lamin is null || lamax is null || lomin is null || lomax is null)
            return BadRequest("Invalid parameters supplied.");
        if(lamin >= lamax)
            return BadRequest("Minimum Latitude must be less than Maximum Latitude.");
        if(lomin >= lomax)
            return BadRequest("Minimum Longitude must be less than Maximum Longitude.");   

        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";   

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var boundingBox = $"lamin={lamin}&lomin={lomin}&lamax={lamax}&lomax={lomax}";

        var url = $"https://opensky-network.org/api/states/all?{boundingBox}";

        // Reuse the factory-managed client across ticks (pooled handler underneath)
        using var client = httpClientFactory.CreateClient();

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(20));
        while (!HttpContext.RequestAborted.IsCancellationRequested)
        {
            List<LiveFlightDto> liveFlights = new List<LiveFlightDto>();
            try
            {     
                using var response = await client.GetAsync(url, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<OpenSkyResponse>(jsonString);
                    if (data?.States != null)
                    {
                        for (int i = 0; i < data.States.Count; i++)
                        {
                            var flight = data.States[i];
                            if(flight.Count < 11)
                                continue;
                            // Access specific elements by index and convert to their types
                            string icao24 = flight[0].GetString() ?? ""; // "a"
                            string callsign = flight[1].GetString()?.Trim() ?? icao24;
                            string origin_country = flight[2].GetString() ?? "Unknown";
                            double? longitude = flight[5].ValueKind != JsonValueKind.Null ? flight[5].GetDouble() : null;
                            double? latitude = flight[6].ValueKind != JsonValueKind.Null ? flight[6].GetDouble() : null;
                            double? baro_altitude = flight[7].ValueKind != JsonValueKind.Null ? flight[7].GetDouble() : null;
                            double? velocity = flight[9].ValueKind != JsonValueKind.Null ? flight[9].GetDouble() : null;
                            double track = flight[10].ValueKind != JsonValueKind.Null ? flight[10].GetDouble() : 0.0;
                            
                            liveFlights.Add(
                                new LiveFlightDto(
                                    icao24, callsign, origin_country, 
                                    latitude, longitude, baro_altitude, velocity, track
                                )
                            );
                        }
                    }
                    // Send ONE complete batch after the loop finishes
                    
                    var json = JsonSerializer.Serialize(liveFlights, jsonOptions);
                    await Response.WriteAsync($"data: {json}\n\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch or stream OpenSky data.");
            }

            try
            {
                await timer.WaitForNextTickAsync(cancellationToken);
            }
            catch(OperationCanceledException)
            {
                break;
            }

        }

        return new EmptyResult();
    }
}