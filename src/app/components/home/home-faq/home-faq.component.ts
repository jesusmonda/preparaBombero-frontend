import { Component } from '@angular/core';

@Component({
  selector: 'app-home-faq',
  standalone: true,
  imports: [],
  templateUrl: './home-faq.component.html',
  styleUrl: './home-faq.component.css'
})
export class HomeFaqComponent {
  testimonials = [
    {
      quote: "Our members are so impressed. It's intuitive. It's clean. It's distraction free. If you're building a community.",
      name: "Sabo Masties",
      title: "Founder @ Rolex",
      image: "logo.jpg"
    },
    {
      quote: "Our members are so impressed. It's intuitive. It's clean. It's distraction free. If you're building a community.",
      name: "Musharof Chowdhury",
      title: "Founder @ Arya UI",
      image: "logo.jpg"
    },
    {
      quote: "Our members are so impressed. It's intuitive. It's clean. It's distraction free. If you're building a community.",
      name: "William Smith",
      title: "Founder @ Trorex",
      image: "logo.jpg"
    }
  ];

  currentTestimonialIndex = 0;

  previous() {
    if (this.currentTestimonialIndex > 0) {
      this.currentTestimonialIndex--;
    }
  }

  next() {
    if (this.currentTestimonialIndex < this.testimonials.length - 1) {
      this.currentTestimonialIndex++;
    }
  }
}
