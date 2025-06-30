import { Component } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './contactus.html',
  styleUrls: ['./contactus.scss']
})
export class ContactUsComponent {
  center: google.maps.LatLngLiteral = { lat: -1.2678, lng: 36.8050 };
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false
  };
  markerPosition: google.maps.LatLngLiteral = this.center;
}
