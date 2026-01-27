-- Allow admins to update any profile (e.g. for wallet balance)
create policy "Admins can update any profile"
  on profiles
  for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to update any submission
create policy "Admins can update any submission"
  on submissions
  for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
