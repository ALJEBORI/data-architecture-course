
### - Resource: [Dimensional Modeling and the Star Schema](https://coginiti.co/learning/data-modeling/dimensional-modeling-star-schema/)
##### - Def: Dimensional modeling is a way of structuring data so that it directly mirrors how the business measures and describes itself. It is standard approach for the analytics-facing layer of a warehouse

## - Facts and dimensions: Dimensional modeling divides the world into two kinds of tables.
- **[Fact tables](https://coginiti.co/glossary/fact-table/)**:  record the _measurements_ of a business process. Each row is one measurement event. like one product scanned at a register.  Fact table columns are of exactly two kinds: **fnumeric facts** (quantities, amounts, durations) and **foreign keys** to dimensions.
- **[Dimension tables](https://coginiti.co/glossary/dimension-table/)**: carry the _descriptive context_ of those measurements: the who, what, where, when, why, and how. A product dimension carries name, brand, category, package size; a customer dimension carries name, segment, region, signup date; a date dimension carries fiscal periods, holiday flags, weekday names. Dimensions are short and wide.
- The split corresponds exactly to how questions are phrased. In _"total **sales amount** by **product category** for **California stores** during **the holiday season**"_, sales amount is a fact; everything else is dimensional context. Dimension attributes become the `GROUP BY` and `WHERE` clauses of every query; facts become the aggregations.

## The star schema: Arrange one fact table at the center with its dimension tables around it, joined by surrogate keys, and you have a **[star schema](https://coginiti.co/glossary/star-schema/)

![[Pasted image 20261021232017.png]]

```sql
SELECT
    p.category,
    d.fiscal_quarter,
    SUM(f.sales_amount) AS total_sales
FROM fct_sales_detail f
JOIN dim_product  p ON f.product_key = p.product_key
JOIN dim_date     d ON f.date_key    = d.date_key
JOIN dim_store    s ON f.store_key   = s.store_key
WHERE s.state = 'CA'
GROUP BY p.category, d.fiscal_quarter;
```


## - The four-step design process: 
- ### Step 1: Select the business process
