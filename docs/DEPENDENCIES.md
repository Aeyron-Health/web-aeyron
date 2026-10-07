# Dependency notes

| Dependency | Reason | License |
| --- | --- | --- |
| `@supabase/supabase-js` 2.116.0 | Establishes a browser-only Supabase Auth session for the account-deletion page. The page then sends the signed-in user's deletion request to Aeyron's existing backend API. It never receives an administrative key. | MIT |
