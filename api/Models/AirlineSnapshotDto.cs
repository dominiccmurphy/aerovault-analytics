public class AirlineSnapshotDto
{
    public DateTime SnapshotDate {get; set;}
    public string IcaoCode {get; set;} = String.Empty;
    public string AirlineName {get; set;} = String.Empty;
    public int ActiveAircraftCount {get; set;}
    public decimal AvgVelocityMs {get; set;}
}