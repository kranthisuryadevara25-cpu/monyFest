# Push your code to GitHub (using your PAT)

Your local branch and GitHub have **diverged**: GitHub has different commits (e.g. 049a673). To make GitHub match your local code (Boost, MonyFest, Contact/Privacy pages, etc.), use a **force push**.

## Force push (recommended – makes GitHub match your local repo)

Replace `YOUR_PAT` with your actual token. This **overwrites** the remote `main` with your local `main`:

```bash
cd /home/surya/Downloads/loyaltyleap-main
git push https://kranthisuryadevara25-cpu:YOUR_PAT@github.com/kranthisuryadevara25-cpu/loyaltyleap.git main --force
```

**Warning:** Any commits that exist only on GitHub (and not in your local branch) will no longer be on `main` after this. Your local code becomes the source of truth.

**Security:** Do not share YOUR_PAT or commit it. After running, revoke the PAT if it was ever exposed (e.g. in a screenshot or log).

---

## Option 2: Normal push (only if remote has no extra commits)

If your local was simply ahead (no divergence), you could run:

```bash
git push https://kranthisuryadevara25-cpu:YOUR_PAT@github.com/kranthisuryadevara25-cpu/loyaltyleap.git main
```

---

## Option 2: Push and let Git prompt for password

```bash
cd /home/surya/Downloads/loyaltyleap-main
git push origin main
```

When Git asks for **Username**: `kranthisuryadevara25-cpu`  
When Git asks for **Password**: paste your **PAT** (not your GitHub account password).

---

## Option 3: Store credentials once (so you don’t paste PAT every time)

```bash
cd /home/surya/Downloads/loyaltyleap-main
git config credential.helper store
git push origin main
```

Use username `kranthisuryadevara25-cpu` and password = your **PAT** when prompted. Git will save them for future pushes (use only on your own machine).

---

## Current state

- **Remote:** `origin` is set to `https://github.com/kranthisuryadevara25-cpu/loyaltyleap.git`
- **Last commit on GitHub:** `049a673`
- **Your local commits to push:** `74d7d8e` (Boost program), `661f75d` (Contact, Terms, Privacy, etc.)

After a successful push, GitHub will show commits up to `661f75d`.
