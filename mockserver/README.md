### Step 1 : unzip  the  file
### Step 2 : Switch to the extract  path
```
cd mockserver
```
### Step 3 : Install Dependencies by running the  following  command 
```
npm install
```
### Step 4 : go the root  folder and Start the Server
```
npm start
```
### Step 5 : Test the Endpoints

#### Auth & User
- Register a new user:
```
curl -X POST 'http://localhost:3000/api/v1/auth/register' \
--header 'Content-Type: application/json' \
--data '{"username":"alice","email":"alice@example.com","password":"password123","role":"Buyer"}'
```
- Login:
```
curl -X POST 'http://localhost:3000/api/v1/auth/login' \
--header 'Content-Type: application/json' \
--data '{"email":"alice@example.com","password":"password123"}'
```
- Logout:
```
curl -X POST 'http://localhost:3000/api/v1/auth/logout'
```
- Get all users:
```
curl 'http://localhost:3000/api/v1/users'
```
- Get user by id:
```
curl 'http://localhost:3000/api/v1/users/1'
```
- Update user:
```
curl -X PUT 'http://localhost:3000/api/v1/users/1' \
--header 'Content-Type: application/json' \
--data '{"name":"Alice Updated","email":"alice@example.com","role":"Buyer"}'
```
- Delete user:
```
curl -X DELETE 'http://localhost:3000/api/v1/users/1'
```
- Get users by role:
```
curl 'http://localhost:3000/api/v1/users?role=Buyer'
```

#### Products
- Get all products:
```
curl 'http://localhost:3000/api/v1/products'
```
- Create a new product:
```
curl -X POST 'http://localhost:3000/api/v1/products' \
--header 'Content-Type: application/json' \
--data '{"product_model":"UPC00001","product_images":[],"description":"A product","auction_date":"2025-09-18","year":2025,"time":"10:00"}'
```
- Get product by id:
```
curl 'http://localhost:3000/api/v1/products/1'
```
- Update product:
```
curl -X PUT 'http://localhost:3000/api/v1/products/1' \
--header 'Content-Type: application/json' \
--data '{"product_model":"UPC00001","description":"Updated"}'
```
- Delete product:
```
curl -X DELETE 'http://localhost:3000/api/v1/products/1'
```
- Get products by seller:
```
curl 'http://localhost:3000/api/v1/products?sellerId=2'
```
- Toggle auction state:
```
curl -X PUT 'http://localhost:3000/api/v1/products/1/date' \
--header 'Content-Type: application/json' \
--data '{"success":true}'
```

#### Auctions
- Get all auctions:
```
curl 'http://localhost:3000/api/v1/auctions'
```
- Post product item in auction:
```
curl -X POST 'http://localhost:3000/api/v1/auctions' \
--header 'Content-Type: application/json' \
--data '{"auctionId":"1","productId":"1"}'
```
- Get auctions for a seller:
```
curl 'http://localhost:3000/api/v1/auctions?sellerId=2'
```
- Get auctions for a product:
```
curl 'http://localhost:3000/api/v1/auctions?productId=1'
```
- Delete auction:
```
curl -X DELETE 'http://localhost:3000/api/v1/auctions/1'
```

#### Bidding
- Get all biddings by product:
```
curl 'http://localhost:3000/api/v1/bidding/1'
```
- Create a bid:
```
curl -X POST 'http://localhost:3000/api/v1/bidding' \
--header 'Content-Type: application/json' \
--data '{"auctionId":"1","amount":150}'
```
- Get bid details by id:
```
curl 'http://localhost:3000/api/v1/bidding/1'
```
- Update bid amount by bidder:
```
curl -X PUT 'http://localhost:3000/api/v1/bidding/1/buyer/1' \
--header 'Content-Type: application/json' \
--data '{"amount":200}'
```
- Get biddings for a product:
```
curl 'http://localhost:3000/api/v1/bidding?productId=1'
```

#### Reviews
- Add a review:
```
curl -X POST 'http://localhost:3000/api/v1/reviews' \
--header 'Content-Type: application/json' \
--data '{"productId":"1","userId":"1","rating":5,"comment":"Great!","sellerId":"2"}'
```
- Get all reviews for a product:
```
curl 'http://localhost:3000/api/v1/reviews?productId=1'
```
- Get all reviews for a seller:
```
curl 'http://localhost:3000/api/v1/reviews?sellerId=2'
```
- Get review by id:
```
curl 'http://localhost:3000/api/v1/reviews/1'
```
- Update review:
```
curl -X PUT 'http://localhost:3000/api/v1/reviews/1' \
--header 'Content-Type: application/json' \
--data '{"rating":4,"comment":"Updated comment"}'
```
- Delete review:
```
curl -X DELETE 'http://localhost:3000/api/v1/reviews/1'
```

## To generate  zip file

```
git archive --format=zip --output=mockserver.zip master
```

