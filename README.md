1

2

3

🔗 URL Shortener (bit.ly Clone) — Backend Tasks
System Overview
A URL Shortening Service split into two complementary backend tasks.
Entity Relationship
🧑‍💻 Manvel Lambaryan — Core Entities & URL Management
Domain: Users, ShortURLs, Tags
Entities
Entity Fields
User id, name, email, created_at
ShortURL id, user_id, original_url, short_code, created_at, expires_at (nullable)
Tag id, name
ShortURL_Tag short_url_id, tag_id
API Endpoints to Implement
Method Endpoint Description
POST /users Register a user
POST /urls Create a short URL (generates a unique short_code)
GET /urls/:short_code Redirect to the original URL
GET /users/:id/urls List all short URLs created by a user
DELETE /urls/:short_code Delete a short URL
POST /urls/:short_code/tags Attach a tag to a short URL
User ──< ShortURL ──< Click
│
└──< Tag >── ShortURL_Tag
Method Endpoint Description
GET /urls/:short_code/tags List all tags of a short URL
Requirements
short_code must be auto-generated (e.g. 6 random alphanumeric characters)
short_code must be unique across the system
If expires_at is set and the date has passed, return 410 Gone
Return 404 if short_code does not exist
A short URL cannot have the same tag twice
Bonus
GET /urls?tag=:name — ﬁlter all short URLs by tag name
🧑‍💻 Mane Nikoghosyan — Click Tracking & Analytics
Domain: Clicks, Analytics
Entities
Entity Fields
Click id, short_url_id, clicked_at, ip_address, country (nullable), device (nullable)
API Endpoints to Implement
Method Endpoint Description
POST /urls/:short_code/click Record a click event on a short URL
GET /urls/:short_code/analytics Get total click count for a short URL
GET /urls/:short_code/analytics/daily Get click counts grouped by day
GET /urls/:short_code/analytics/devices Get click counts grouped by device type
GET /users/:id/analytics Get total clicks across all URLs of a user
GET /urls/top Get top 5 most clicked short URLs
Requirements
clicked_at must be auto-set to current timestamp
device should be one of: mobile , desktop , tablet , unknown
Return 404 if short_code does not exist
Daily analytics must return results sorted by date ascending
Top URLs endpoint must use aggregation (no sorting in app code)
Bonus
GET /urls/:short_code/analytics?from=DATE&to=DATE — ﬁlter analytics by date range
🔗 How the Two Parts Connect
Mane's Click entity references Manvel's ShortURL via short_url_id . The click recording in
Mane's part is triggered right after the redirect in Manvel's GET /urls/:short_code endpoint —
they must coordinate this behavior.
✅ Evaluation Criteria (Both Students)
Correct entity relationships and foreign keys
Proper HTTP status codes and error handling (404, 410, etc.)
Data validation (unique short codes, valid device types, no duplicate tags)
Aggregation queries done at the database level, not in application code
Clean and readable code structure
⏱ Time Limit: 1 Day