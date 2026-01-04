export function PageHero() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Alcohol & Drug Addiction, Treatment And Rehabs In California
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          California, a state on the U.S. west coast, had a population of 39,029,342 in 2022. 
          The median age in 2021 was 37 years, with a median income of $36,281 that year. 
          In 2023, California's unemployment rate stood at 4.9%. Life expectancy in 2020 
          was 79 years. Additionally, in 2021, 28.76% of the population was classified as 
          obese, 15.7% reported binge drinking, and 11.47% were smokers.{" "}
          <a href="#" className="text-primary hover:underline">
            Know more about California
          </a>
        </p>
      </div>
      
      {/* California Flag */}
      <div className="flex-shrink-0">
        <div className="w-32 h-20 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs font-bold text-foreground">CALIFORNIA</div>
            <div className="text-[8px] text-muted-foreground">REPUBLIC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
