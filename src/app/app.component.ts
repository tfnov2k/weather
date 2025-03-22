import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe, NgIf } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
import { parseStringPromise } from 'xml2js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  data: any;
  title = 'weather';
  countryName: string = '';
  locationName: string = '';
  currentWeather: string = '';
  sunriseTime: string = '';
  sunsetTime: string = '';

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {console.log('AppComponent constructor called');}

  ngOnInit(): void {
    console.log('ngOnInit started, platform is browser:', isPlatformBrowser(this.platformId));
    
    // Make the API call regardless of platform
    this.apiService.getData().subscribe({
      next: (response) => {
        console.log('API response received:', response ? 'data exists' : 'no data');
        
        if (typeof response === 'string') {
          console.log('Response preview:', response.substring(0, 100));
        } else {
          console.log('Response type:', typeof response);
        }
        
        this.data = response;
        
        // Parse XML differently depending on platform
        if (isPlatformBrowser(this.platformId)) {
          console.log('Parsing in browser');
          try {
            // Browser-side parsing
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response, "text/xml");
            console.log('XML parsed successfully');
            
            // Get the country value and store it
            const countryElement = xmlDoc.querySelector("location > country");
            if (countryElement && countryElement.textContent) {
              this.countryName = countryElement.textContent;
              console.log('Country:', this.countryName);
            }

            // Get the location value and store it
            const locationElement = xmlDoc.querySelector("location > name");
            if (locationElement && locationElement.textContent) {
              this.locationName = locationElement.textContent;
              console.log('Location:', this.locationName);
            }

            // Get the sunrise time value and store it
          const sunriseElement = xmlDoc.querySelector("sun > sunrise");
          if (sunriseElement && sunriseElement.textContent) {
          // Extract just the time portion (last 8 characters) from the data
            this.sunriseTime = sunriseElement.textContent.slice(-8);
            console.log('Sunrise time:', this.sunriseTime);
          }

            // Get current time and find matching forecast
            const currentTime = new Date();
            console.log('Current time:', currentTime);
            
            // Get all time elements
            const timeElements = xmlDoc.querySelectorAll("time");
            
            // Find the matching time period
            for (let i = 0; i < timeElements.length; i++) {
              const timeElement = timeElements[i];
              const fromStr = timeElement.getAttribute("from");
              const toStr = timeElement.getAttribute("to");
              
              if (fromStr && toStr) {
                const fromTime = new Date(fromStr);
                const toTime = new Date(toStr);
                
                if (currentTime >= fromTime && currentTime < toTime) {
                  // Found the right time period
                  const symbolElement = timeElement.querySelector("symbol");
                  if (symbolElement) {
                    this.currentWeather = symbolElement.getAttribute("name") || "";
                    console.log('Current weather:', this.currentWeather);
                  }
                  break;
                }
              }
            }
          } catch (err) {
            console.error('Error parsing XML in browser:', err);
          }
        } else {
          console.log('Parsing on server');
          // Server-side parsing (Not being used??)
          parseStringPromise(response).then(result => {
            this.countryName = result.weatherdata.location[0].country[0];
            console.log('Country:', this.countryName);
            this.locationName = result.weatherdata.location[0].name[0];
            console.log('Location:', this.locationName);
            console.log('Weather:', this.currentWeather);
          }).catch(err => console.error('Error parsing XML on server:', err));
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        console.log('API call completed');
      }
    });
  }

  ngAfterViewInit(): void {
    // Only access document when in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const textarea = document.getElementById('textbox');
      if (textarea) {
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        });
      }
    }
  }
}