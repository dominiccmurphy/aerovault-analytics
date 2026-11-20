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
public class LiveRadarController(ILogger<LiveFlightDto> logger) : ControllerBase
{
    [HttpGet("stream")]
    public async Task Get(CancellationToken cancellationToken)
    {
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";   

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var boundingBox = "lamin=56.5&lomin=-6.0&lamax=59.0&lomax=-2.0";

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

                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        var data = JsonSerializer.Deserialize<OpenSkyResponse>(jsonString);
                        if (data?.States != null)
                        {
                            for (int i = 0; i < data.States.Count; i++)
                            {
                                var flight = data.States[i];
                                // Access specific elements by index and convert to their types
                                string icao24 = flight[0].GetString() ?? ""; // "a"
                                string callsign = flight[1].GetString()?.Trim() ?? icao24;
                                string origin_country = flight[2].GetString() ?? "Unknown";
                                double longitude = flight[5].GetDouble();
                                double latitude = flight[6].GetDouble();
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
    }
}