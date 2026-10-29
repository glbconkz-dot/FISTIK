const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: before, error: e1 } = await sb
    .from("products")
    .select("slug,image_url,image_urls")
    .eq("slug", "cake-medovik")
    .maybeSingle();
  if (e1) {
    console.error("BEFORE_ERROR", e1);
    process.exit(1);
  }
  console.log("BEFORE", JSON.stringify(before, null, 2));

  const gallery =
    before && Array.isArray(before.image_urls) && before.image_urls.length > 0
      ? before.image_urls
      : [
          "/products/classic-cakes/honey-cake-slice.png",
          "/products/classic-cakes/honey-cake-top.png",
        ];

  const payload = {
    image_url: "/products/classic-cakes/honey-cake.png",
    image_urls: gallery,
  };

  const { data: after, error: e2 } = await sb
    .from("products")
    .update(payload)
    .eq("slug", "cake-medovik")
    .select("slug,image_url,image_urls")
    .maybeSingle();
  if (e2) {
    console.error("UPDATE_ERROR", e2);
    process.exit(1);
  }
  console.log("AFTER", JSON.stringify(after, null, 2));
  console.log("UPDATE_SUCCESS", !!after);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
