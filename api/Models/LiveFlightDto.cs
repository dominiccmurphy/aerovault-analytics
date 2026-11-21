namespace web_api.Models;

public record LiveFlightDto(
    string Icao24,
    string Callsign,
    string OriginCountry,
    double? Latitude,
    double? Longitude,
    double? BaroAltitudeMeters,
    double? VelocityMs,
    double TrueTrackDegrees
);