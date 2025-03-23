// app.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  private apiKey = '4aed509082adebc325e98c604c0ad033';
  
  constructor(private http: HttpClient) {
    console.log('ApiService instantiated');
  }

  getData(location: string = 'London'): Observable<any> {
    const params = new HttpParams()
      .set('q', location)
      .set('mode', 'xml')
      .set('appid', this.apiKey);

    return this.http.get(this.apiUrl, { params, responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Error fetching weather data:', error);
        return throwError(() => error);
      })
    );
  }
}