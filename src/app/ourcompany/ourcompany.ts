import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './ourcompany.html',
  styleUrls: ['./ourcompany.scss']
})
export class OurCompany {
  images = [
    '/images/hrm-01.png',
    '/images/hrm-02.png',
    '/images/hrm-03.png',
    '/images/hrm-04.png',
    '/images/hrm-05.png'
  ];

  centerIndex = 2;
  isSliding = false;
  scrollDirection: 'left' | 'right' | null = null;

  scrollLeft() {
    if (this.isSliding) return;
    this.scrollDirection = 'left';
    this.isSliding = true;

    setTimeout(() => {
      this.centerIndex = (this.centerIndex - 1 + this.images.length) % this.images.length;
      this.isSliding = false;
      this.scrollDirection = null;
    }, 300); // matches duration-300 in Tailwind
  }

  scrollRight() {
    if (this.isSliding) return;
    this.scrollDirection = 'right';
    this.isSliding = true;

    setTimeout(() => {
      this.centerIndex = (this.centerIndex + 1) % this.images.length;
      this.isSliding = false;
      this.scrollDirection = null;
    }, 300);
  }

  getSideImage(offset: number) {
    const index = (this.centerIndex + offset + this.images.length) % this.images.length;
    return this.images[index];
  }
}
