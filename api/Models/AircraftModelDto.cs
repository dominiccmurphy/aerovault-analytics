public class AircraftModelDto
{
    public int ModelId {get; set;}
    public string Manufacturer {get; set;} = String.Empty;
    public string Headquarters {get; set;} = String.Empty;
    public string ModelName {get; set;} = String.Empty;
    public string AircraftClass {get; set;} = String.Empty;
    
    public decimal? MaxSpeedKnots {get; set;}
    public decimal? MaxRangeNm {get; set;}
    public int? PassengerCapacity {get; set;}
    public decimal? PriceMillionsUsd {get; set;}
    public decimal? CostPerSeatMillionsUsd {get; set;}
}