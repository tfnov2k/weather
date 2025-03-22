import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe, NgIf } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  data: any;
  title = 'weather';

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.apiService.getData().subscribe({
      next: (response) => {
        this.data = response;
        console.log('API Data:', response);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
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