Here is a step-by-step, practical example of how you build and query a **Star Schema** for an e-commerce platform.

### Step 1: Define the Tables

Imagine an online electronics store. We want to track sales performance across different products, customers, store channels, and time.
#### 1. The Fact Table (Center of the Star)

`fact_sales` captures every individual sale line item.


| **sale_id** | **date_key** | **customer_key** | **product_key** | **store_key** | **quantity** | **unit_price** | **discount_amount** | **total_amount** |
| ----------- | ------------ | ---------------- | --------------- | ------------- | ------------ | -------------- | ------------------- | ---------------- |
| **1001**    | 20261022     | C-88             | P-101           | S-05          | 2            | $250.00        | $10.00              | **$490.00**      |
| **1002**    | 20261022     | C-92             | P-205           | S-01          | 1            | $1,200.00      | $0.00               | **$1,200.00**    |
| **1003**    | 20261022     | C-88             | P-101           | S-05          | 1            | $250.00        | $0.00               | **$250.00**      |

#### 2. The Dimension Tables (Points of the Star)

- **`dim_product`** (Descriptive details about what is sold)
    
```rich-table
---
version: 2
columns:
  - id: c_uxa4c0
    name: product_key
  - id: c_vpvaq1
    name: product_name
  - id: c_oivhxg
    name: brand
  - id: c_xicwmy
    name: category
  - id: c_ch5tns
    name: cost_price
rows:
  - id: r_i4wvs0
    cells:
      c_uxa4c0: "**P-101**"
      c_vpvaq1: Wireless Headphones
      c_oivhxg: AudioPro
      c_xicwmy: Electronics
      c_ch5tns: $120.00
  - id: r_m386hg
    cells:
      c_uxa4c0: "**P-205**"
      c_vpvaq1: Developer Laptop 15"
      c_oivhxg: TechCorp
      c_xicwmy: Computers
      c_ch5tns: $850.00
theme: grid
viewWidth: 910
zoom: 93
---
```
    
- **`dim_customer`** (Descriptive details about who bought it)
    
      
    ****
```rich-table
---
version: 2
columns:
  - id: c_864s50
    name: "**customer_key**"
  - id: c_r0sviz
    name: "**full_name**"
  - id: c_jd6kiq
    name: "**country**"
  - id: c_26brma
    name: "**city**"
  - id: c_mdj3i5
    name: "**customer_segment**"
rows:
  - id: r_6g6gw8
    cells:
      c_864s50: "**C-88**"
      c_r0sviz: Sarah Connor
      c_jd6kiq: France
      c_26brma: Lyon
      c_mdj3i5: VIP
  - id: r_8sor40
    cells:
      c_864s50: "**C-92**"
      c_r0sviz: John Doe
      c_jd6kiq: USA
      c_26brma: Austin
      c_mdj3i5: Standard
theme: grid
---
```
    
- **`dim_store`** (Where or through which channel it was sold)
      
```rich-table
---
version: 2
columns:
  - id: c_rbvzrb
    name: store_key
  - id: c_4n8omr
    name: store_name
  - id: c_8ou4i2
    name: channel_type
  - id: c_rr7y1i
    name: region
rows:
  - id: r_m8uz8u
    cells:
      c_rbvzrb: "**S-01**"
      c_4n8omr: Web Shop US
      c_8ou4i2: Online
      c_rr7y1i: North America
  - id: r_kxgqyq
    cells:
      c_rbvzrb: "**S-05**"
      c_4n8omr: Retail Flagship
      c_8ou4i2: Physical Store
      c_rr7y1i: Europe
styles:
  - target: header.c_rbvzrb
    color: "#00f054"
    bold: true
  - target: header.c_4n8omr
    color: "#77f410"
  - target: header.c_8ou4i2
    color: "#4de316"
  - target: header.c_rr7y1i
    color: "#50e619"
theme: grid
---
```
    
- **`dim_date`** (Time attributes to slice and dice by calendar periods)
    
```rich-table
---
version: 2
columns:
  - id: c_bjueno
    name: "**date_key**"
  - id: c_r50yr2
    name: "**full_date**"
  - id: c_wgnicj
    name: "**day_of_week**"
  - id: c_b1jub0
    name: "**month_name**"
  - id: c_xdnjuz
    name: "**quarter**"
  - id: c_ngh1eq
    name: "**year**"
  - id: c_kdq9y3
    name: "**is_weekend**"
rows:
  - id: r_26os7q
    cells:
      c_bjueno: "**20261022**"
      c_r50yr2: 2026-10-22
      c_wgnicj: Thursday
      c_b1jub0: October
      c_xdnjuz: Q4
      c_ngh1eq: "2026"
      c_kdq9y3: "False"
theme: grid
---
```
    

### Step 2: The SQL Query in Action

Suppose a business analyst asks:

  

> _"What was our total revenue and total units sold for 'Electronics' in Europe during Q4 2026?"_
> 
>   

Because of the Star Schema structure, writing this SQL query is simple and intuitive:

  

SQL

```
SELECT 
    p.category,
    s.region,
    d.quarter,
    d.year,
    SUM(f.quantity)     AS total_units_sold,
    SUM(f.total_amount) AS total_revenue
FROM fact_sales f
-- Join to dimensions using simple foreign key matches
JOIN dim_product p  ON f.product_key  = p.product_key
JOIN dim_store s    ON f.store_key    = s.store_key
JOIN dim_date d     ON f.date_key     = d.date_key
-- Filter by descriptive dimension attributes
WHERE p.category = 'Electronics'
  AND s.region   = 'Europe'
  AND d.quarter  = 'Q4'
  AND d.year     = 2026
GROUP BY 
    p.category,
    s.region,
    d.quarter,
    d.year;
```

### Step 3: Why This Design Works so Well

1. **Simple Joins (1-to-Many):** Every `JOIN` goes directly from the central fact table to a dimension table. You don't have to string together 10 different nested tables to find out what category a product belongs to.
    
      
    
2. **Denormalization for Speed:** Notice that `category` is stored directly inside `dim_product`, rather than creating a separate `categories` table. This slight redundancy is intentional—it trades a tiny bit of storage space to avoid expensive extra database joins.
    
      
    
3. **Aggregations are Fast:** The fact table contains pre-calculated numbers (`quantity`, `total_amount`), making functions like `SUM()` and `AVG()` execute rapidly even over billions of rows.