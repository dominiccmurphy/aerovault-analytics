public class CountrySnapshotDto
{
    public DateTime SnapshotDate {get; set;}
    public string OriginCountry {get; set;} = String.Empty;
    public int ActiveAircraftCount {get; set;}
    public decimal AvgVelocityMs {get; set;}
}