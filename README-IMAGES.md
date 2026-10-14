# Why the screenshots were not showing

Both zips you uploaded (`Claude-Deep-Dive-main` and `Complete-Claude-Deep-Dive-main`) contain the
**same 127 PNG files, but they are Git LFS pointer files** (130-byte text files that start with
`version https://git-lfs.github.com/spec/v1`), not real pictures. A repository zip download from
GitHub/Gitea does not include LFS content. The browser cannot decode them, so every screen fell back
to the placeholder. The real images total about 111 MB.

## Get the real images (one time)

In a normal clone of your repository (not the zip):

```bash
git lfs install
git lfs pull
```

Then copy the real files over this project:

```bash
cp -r <your-clone>/assets/images/*  public/images/
```

(For the JS project the images live in `assets/images/`, for this React project in `public/images/`;
the file names are identical.) Run `npm run check:images` to confirm; it prints a tick when all files are real.

## 14 screens never had a picture
m02-s04..s07, m03-s04, m03-s10, m04-s17, m05-s04, m05-s07, m05-s10, m06-s12, m08-s11, m09-s04, m09-s08
are marked `"visuals": 1` but no `<id>.png` exists in either zip. They now show a designed "app window"
card. To use a real screenshot, add `public/images/<screen-id>.png`.
