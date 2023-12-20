# Project: Nest.js Kafka

## How to run
```
npm run start
```

## Workflow
1. Consume order requests from the topic: `order.request`.
2. Check reference ID from redis
   - If it exists, reject the order request.
3. Validate the order request.
   - If it is invalid, reject the order request.
4. Query user information from the database.
   - If the user is not found, reject the order request.
5. Query product information from the database.
   - If the product is out of stock or not found, process the available products only.
6. Decrease the quantity of the product in the database.
7. Save order request history to the database
8. Publish the result of the order request processing to the topic: `order.result`.