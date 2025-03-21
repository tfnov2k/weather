import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe, NgIf } from '@angular/common';  
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, NgIf, HttpClientModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  data: any;

  constructor(private apiService: ApiService) {}

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