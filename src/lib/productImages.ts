export function getProductCategoryPhoto(titleOrQuery: string): string {
  const q = (titleOrQuery || "").toLowerCase();

  // iPhones
  if (q.includes("iphone")) {
    return "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80";
  }

  // Samsung Phones
  if (
    q.includes("galaxy") ||
    q.includes("s25") ||
    q.includes("s24") ||
    q.includes("s23") ||
    q.includes("z fold") ||
    q.includes("z flip") ||
    q.includes("s22")
  ) {
    return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80";
  }

  // Google Pixel
  if (q.includes("pixel")) {
    return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80";
  }

  // General Smartphones (OnePlus, Xiaomi, Redmi, Realme, Vivo, Oppo, Motorola, Nothing, iQOO)
  if (
    q.includes("phone") ||
    q.includes("oneplus") ||
    q.includes("xiaomi") ||
    q.includes("redmi") ||
    q.includes("realme") ||
    q.includes("vivo") ||
    q.includes("oppo") ||
    q.includes("motorola") ||
    q.includes("nothing") ||
    q.includes("iqoo") ||
    q.includes("smartphone") ||
    q.includes("mobile")
  ) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80";
  }

  // MacBooks & Apple Laptops
  if (
    q.includes("macbook") ||
    q.includes("mac book") ||
    q.includes("macbook pro") ||
    q.includes("macbook air")
  ) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80";
  }

  // Windows / Gaming Laptops (Dell, HP, Lenovo, Asus, Acer, MSI, ThinkPad, Surface)
  if (
    q.includes("laptop") ||
    q.includes("dell") ||
    q.includes("thinkpad") ||
    q.includes("ideapad") ||
    q.includes("vivobook") ||
    q.includes("zenbook") ||
    q.includes("rog") ||
    q.includes("zephyrus") ||
    q.includes("pavilion") ||
    q.includes("spectre") ||
    q.includes("envy") ||
    q.includes("alienware") ||
    q.includes("legion") ||
    q.includes("swift") ||
    q.includes("predator")
  ) {
    return "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80";
  }

  // Tablets & iPads
  if (
    q.includes("ipad") ||
    q.includes("tablet") ||
    q.includes("tab ") ||
    q.includes("galaxy tab") ||
    q.includes("surface pro")
  ) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80";
  }

  // Smartwatches & Fitness Bands
  if (
    q.includes("watch") ||
    q.includes("smartwatch") ||
    q.includes("apple watch") ||
    q.includes("galaxy watch") ||
    q.includes("fitbit") ||
    q.includes("garmin") ||
    q.includes("amazfit") ||
    q.includes("noise")
  ) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  }

  // Wireless Earbuds / AirPods / TWS
  if (
    q.includes("airpods") ||
    q.includes("earbuds") ||
    q.includes("tws") ||
    q.includes("airpods pro") ||
    q.includes("galaxy buds") ||
    q.includes("freebuds")
  ) {
    return "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80";
  }

  // Headphones / Over-Ear
  if (
    q.includes("headphone") ||
    q.includes("headphones") ||
    q.includes("sony wh") ||
    q.includes("bose") ||
    q.includes("jbl") ||
    q.includes("sennheiser")
  ) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  }

  // Televisions / Smart TVs / OLED / QLED / Monitors
  if (
    q.includes("tv") ||
    q.includes("television") ||
    q.includes("oled") ||
    q.includes("qled") ||
    q.includes("bravia") ||
    q.includes("lg tv") ||
    q.includes("samsung tv") ||
    q.includes("monitor") ||
    q.includes("display")
  ) {
    return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80";
  }

  // Cameras / Photography / Sony Alpha / Canon / Nikon / GoPro
  if (
    q.includes("camera") ||
    q.includes("canon") ||
    q.includes("nikon") ||
    q.includes("sony alpha") ||
    q.includes("fujifilm") ||
    q.includes("dslr") ||
    q.includes("gopro")
  ) {
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";
  }

  // Gaming Consoles & Accessories (PS5, Xbox, Nintendo Switch, Controller)
  if (
    q.includes("ps5") ||
    q.includes("playstation") ||
    q.includes("xbox") ||
    q.includes("nintendo") ||
    q.includes("console") ||
    q.includes("controller") ||
    q.includes("dualsense")
  ) {
    return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80";
  }

  // Shoes / Sneakers / Apparel
  if (
    q.includes("shoe") ||
    q.includes("sneaker") ||
    q.includes("nike") ||
    q.includes("adidas") ||
    q.includes("puma") ||
    q.includes("jordan") ||
    q.includes("footwear")
  ) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80";
  }

  // Smart Speakers / Home Audio
  if (
    q.includes("speaker") ||
    q.includes("echo") ||
    q.includes("homepod") ||
    q.includes("alexa") ||
    q.includes("soundbar")
  ) {
    return "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80";
  }

  // Default clean tech/electronics photo
  return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
}

export function getFallbackPhotoList(titleOrQuery: string): string[] {
  const primary = getProductCategoryPhoto(titleOrQuery);
  return [
    primary,
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
  ];
}
