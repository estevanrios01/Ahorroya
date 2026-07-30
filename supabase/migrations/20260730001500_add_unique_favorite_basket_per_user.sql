-- Prevents the race in db.favorites.toggle() where two near-simultaneous
-- calls (e.g. a client retry on a flaky connection) both see no existing
-- favorites basket and both insert one, permanently breaking un-favoriting
-- for that user (maybeSingle() then errors on >1 row, and the code treats
-- that the same as "no basket", inserting yet another one every call).
create unique index baskets_one_favorite_per_user
  on baskets (user_id)
  where favorite = true;
