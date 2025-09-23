# Schiehallion Hotel Website Analysis

## Website Overview

The Schiehallion Hotel website represents a traditional Scottish hotel located in Aberfeldy, Perthshire. The site focuses on accommodation booking, dining services, and promoting local attractions. It serves as both an informational resource and a booking platform for a locally-owned hotel business with strong emphasis on Scottish hospitality and location-based tourism.

## Data Structure

### 1. Hotel Information Hierarchy

- **Hotel Identity**: Name, tagline ("Friendly Welcoming Hotel"), branding
- **Location**: Full address (6 Dunkeld Street, Aberfeldy, Perth and Kinross, PH15 2AF)
- **Contact Details**: Phone (01887 820421), Email (bookings@schiehallionhotel.co.uk)
- **Coordinates**: Latitude 56.62050800000000, Longitude -3.86299300000000

### 2. Accommodation Data Structure

- **Room Types**: Double, Twin, Family, Deluxe categories
- **Occupancy Data**: Adult/children capacity for each room
- **Package Options**: Breakfast-only vs. Breakfast & Dinner packages
- **Room Features**: En-suite facilities, spaciousness descriptions

### 3. Service Information

- **Facilities List**: Bar, Restaurant, Free WiFi, Credit Card acceptance, Family rooms, Golf access, etc.
- **Dining Services**: Traditional Scottish menu, breakfast service, afternoon tea, Sunday roasts

## Content Types

### 1. Accommodation Content

- 15+ different room configurations/packages
- Room descriptions with occupancy details
- Package inclusions (breakfast, dinner combinations)
- Room imagery and descriptions

### 2. Dining Information

- Restaurant descriptions
- Menu information (traditional, seasonal, local produce)
- Service times and special offerings
- Breakfast service details

### 3. Local Attractions Content

- **Activity categories**: Outdoor adventure, Water sports, Cultural sites, Golf
- **Partner businesses**: Splash adventure center, Beyond Adventure, Dewars Distillery
- **Attraction descriptions** with contact information
- **Activity pricing** where provided

### 4. Review/Testimonial Data

- Customer reviews with ratings (4.8/5 overall from 1031 reviews)
- Review metadata: reviewer names, dates, ratings
- Review categories and sentiment analysis
- Rating breakdown (76% 5-star, 24% 4-star)

## Information Architecture

- **Primary Navigation**: Home, Rooms, Booking, Dining, Attractions, Gallery, Reviews
- **Secondary Navigation**: Special Offers, Location (under "More" dropdown)
- **Content Organization**: Information flows from general hotel info to specific services
- **Booking Integration**: Third-party booking widget (hotels.uk.com) embedded throughout
- **Social Integration**: Facebook, Twitter feeds integrated into sidebar

## Technical Data Elements

### 1. Booking System Integration

- Hotel ID: 13881
- Token-based authentication for booking widget
- Third-party integration with hotels.uk.com/Queensborough platform

### 2. Review System

- Verified review system with 1031 reviews
- Star rating aggregation and breakdown
- Review filtering and pagination

### 3. Location Services

- Google Maps integration
- GPS coordinates embedded
- Location-based content delivery

### 4. Social Media Integration

- Facebook page integration
- Twitter timeline widget
- Review aggregation from external platforms

## Sample Data

### Sample Room

"Twin en-suite room (Breakfast and Dinner)" - Occupancy: Adults: 2, Children: 0

### Sample Review

"Great room and very good breakfast. Definitely value for money" - Rating: 5/5, Reviewer: Neil, Date: Feb 2024

### Sample Attraction

"Dewars Distillery" - Interactive heritage center, cask tasting, 2 miles from hotel

### Sample Facility

"Free WiFi, Bar, Restaurant, Family Room Available, Golf Course within 2 miles"

## Recommendations for Rebuild

1. **Database Schema**: Create normalized tables for Rooms, Packages, Reviews, Attractions, and Facilities
2. **Content Management**: Implement a CMS for easy updating of room descriptions, pricing, and attraction information
3. **Booking Integration**: Maintain API integration capabilities for third-party booking systems
4. **Review System**: Build or integrate a review management system with moderation capabilities
5. **Location Services**: Maintain Google Maps integration and GPS coordinate storage
6. **SEO Structure**: Preserve the location-based SEO keywords and meta descriptions
7. **Social Integration**: Plan for social media feed integration and sharing capabilities
8. **Mobile Optimization**: Ensure responsive design for the significant mobile traffic
9. **Analytics**: Implement tracking for booking conversions and user journey analysis
10. **Content Categorization**: Maintain clear separation between accommodation, dining, and attraction content for easy navigation

## Summary

The Schiehallion Hotel website represents a well-structured hospitality business website with clear data hierarchies, comprehensive accommodation information, integrated booking systems, and strong local attraction content. The data structure shows a traditional hotel business model with multiple room configurations, dining services, and emphasis on local tourism partnerships.
