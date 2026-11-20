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
public class LiveRadarController(NpgsqlDataSource dataSource, ILogger<AircraftController> logger) : ControllerBase
{
    [HttpGet("stream")]
    public async Task Get(CancellationToken cancellationToken)
    {
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";   

        var boundingBox = "lamin=50.0&lomin=-2.0&lamax=53.5&lomax=4.5";

        var url = $"https://opensky-network.org/api/states/all?{boundingBox}";

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(20));
        while (!HttpContext.RequestAborted.IsCancellationRequested)
        {
            List<LiveFlightDto> liveFlights = new List<LiveFlightDto>();
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var response = await client.GetAsync(url, cancellationToken);
                    logger.LogInformation("Getting response from: {s}", url);

                    if (response.IsSuccessStatusCode)
                    {
                        logger.LogInformation("Response not null");
                        var jsonString = await response.Content.ReadAsStringAsync();
                        var data = JsonSerializer.Deserialize<OpenSkyResponse>(jsonString);
                        logger.LogInformation("Deserialized data: {s}", jsonString);
                        if (data?.States != null)
                        {
                            for (int i = 0; i < data.States.Count; i++)
                            {
                                var flight = data.States[i];
                                // Access specific elements by index and convert to their types
                                string icao24 = flight[0].GetString(); // "a"
                                string callsign = flight[1].GetString()?.Trim();
                                string origin_country = flight[2].GetString();
                                double longitude = flight[5].ValueKind != JsonValueKind.Null ? flight[5].GetDouble() : 0.0;
                                double latitude = flight[6].ValueKind != JsonValueKind.Null ? flight[6].GetDouble() : 0.0;
                                double? baro_altitude = flight[7].ValueKind != JsonValueKind.Null ? flight[7].GetDouble() : null;
                                double? velocity = flight[9].ValueKind != JsonValueKind.Null ? flight[9].GetDouble() : null;
                                double track = flight[10].ValueKind != JsonValueKind.Null ? flight[10].GetDouble() : 0.0;
                                
                                logger.LogInformation("Reading finished");
                                liveFlights.Add(
                                    new LiveFlightDto(
                                        icao24, callsign, origin_country, 
                                        latitude, longitude, baro_altitude, velocity, track
                                    )
                                );
                            }
                        }
                        var json = JsonSerializer.Serialize(liveFlights, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                        await Response.WriteAsync($"data: {json}\n\n", cancellationToken);
                        await Response.Body.FlushAsync(cancellationToken);
                    }
                }
            }
            catch (Exception ex)
            {
                
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
        
        
        return;
    }
}