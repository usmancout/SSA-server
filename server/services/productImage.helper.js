/**
 * Real-life high-resolution product photography mapping for the 80-product catalog
 * across Martello Downtown, Martello West, Prodexa Central, and Storenta Plaza.
 */

const REAL_PRODUCT_IMAGES_BY_ID = {
  // Electronics (24)
  'prod-iphone-16-pro-max': '/products/prod-iphone-16-pro-max.jpg',
  'prod-iphone-15-pro-max': '/products/prod-iphone-15-pro-max.jpg',
  'prod-samsung-s24-ultra': '/products/prod-samsung-s24-ultra.jpg',
  'prod-google-pixel-9-pro': '/products/prod-google-pixel-9-pro.jpg',
  'prod-oneplus-12-5g': '/products/prod-oneplus-12-5g.jpg',
  'prod-xiaomi-14-ultra': '/products/prod-xiaomi-14-ultra.jpg',
  'prod-samsung-qled-tv-65': '/products/prod-samsung-qled-tv-65.jpg',
  'prod-lg-oled-c4-55': '/products/prod-lg-oled-c4-55.jpg',
  'prod-samsung-buds2-pro': '/products/prod-samsung-buds2-pro.jpg',
  'prod-airpods-pro-2-usbc': '/products/prod-airpods-pro-2-usbc.jpg',
  'prod-macbook-air-m3': '/products/prod-macbook-air-m3.jpg',
  'prod-macbook-pro-m3-max': '/products/prod-macbook-pro-m3-max.jpg',
  'prod-dell-xps-15-oled': '/products/prod-dell-xps-15-oled.jpg',
  'prod-asus-rog-zephyrus-g16': '/products/prod-asus-rog-zephyrus-g16.jpg',
  'prod-hp-spectre-x360-14': '/products/prod-hp-spectre-x360-14.jpg',
  'prod-sony-wh1000xm5': '/products/prod-sony-wh1000xm5.jpg',
  'prod-bose-quietcomfort-ultra': '/products/prod-bose-quietcomfort-ultra.jpg',
  'prod-ps5-slim-console': '/products/prod-ps5-slim-console.jpg',
  'prod-xbox-series-x': '/products/prod-xbox-series-x.jpg',
  'prod-nintendo-switch-oled': '/products/prod-nintendo-switch-oled.jpg',
  'prod-ipad-pro-m4': '/products/prod-ipad-pro-m4.jpg',
  'prod-canon-eos-r6-mark2': '/products/prod-canon-eos-r6-mark2.jpg',
  'prod-logitech-mx-master-3s': '/products/prod-logitech-mx-master-3s.jpg',
  'prod-keychron-q1-pro-keyboard': '/products/prod-keychron-q1-pro-keyboard.jpg',

  // Fashion (18)
  'prod-nike-jordan-1-retro': '/products/prod-nike-jordan-1-retro.jpg',
  'prod-nike-pegasus-41-shoes': '/products/prod-nike-pegasus-41-shoes.jpg',
  'prod-nike-air-force-1-07': '/products/prod-nike-air-force-1-07.jpg',
  'prod-adidas-ultraboost-light': '/products/prod-adidas-ultraboost-light.jpg',
  'prod-new-balance-990v6': '/products/prod-new-balance-990v6.jpg',
  'prod-puma-velocity-nitro-shoes': '/products/prod-puma-velocity-nitro-shoes.jpg',
  'prod-nike-dri-fit-training-shirt': '/products/prod-nike-dri-fit-training-shirt.jpg',
  'prod-tommy-hilfiger-oxford-shirt': '/products/prod-tommy-hilfiger-oxford-shirt.jpg',
  'prod-ralph-lauren-pique-polo-shirt': '/products/prod-ralph-lauren-pique-polo-shirt.jpg',
  'prod-lacoste-cotton-crew-shirt': '/products/prod-lacoste-cotton-crew-shirt.jpg',
  'prod-levis-511-slim-jeans': '/products/prod-levis-511-slim-jeans.jpg',
  'prod-levis-trucker-jacket': '/products/prod-levis-trucker-jacket.jpg',
  'prod-north-face-nuptse-jacket': '/products/prod-north-face-nuptse-jacket.jpg',
  'prod-rayban-aviator-classic': '/products/prod-rayban-aviator-classic.jpg',
  'prod-oakley-holbrook-sunglasses': '/products/prod-oakley-holbrook-sunglasses.jpg',
  'prod-fossil-chronograph-watch': '/products/prod-fossil-chronograph-watch.jpg',
  'prod-tissot-prx-powermatic': '/products/prod-tissot-prx-powermatic.jpg',
  'prod-michael-kors-tote-bag': '/products/prod-michael-kors-tote-bag.jpg',

  // Home & Garden (12)
  'prod-instant-pot-pro-8qt': '/products/prod-instant-pot-pro-8qt.jpg',
  'prod-dyson-v15-detect': '/products/prod-dyson-v15-detect.jpg',
  'prod-breville-barista-express': '/products/prod-breville-barista-express.jpg',
  'prod-ninja-foodi-dualzone-airfryer': '/products/prod-ninja-foodi-dualzone-airfryer.jpg',
  'prod-kitchenaid-artisan-mixer': '/products/prod-kitchenaid-artisan-mixer.jpg',
  'prod-philips-hue-starter-kit': '/products/prod-philips-hue-starter-kit.jpg',
  'prod-irobot-roomba-j7-plus': '/products/prod-irobot-roomba-j7-plus.jpg',
  'prod-herman-miller-aeron-chair': '/products/prod-herman-miller-aeron-chair.jpg',
  'prod-vitamix-a3500-blender': '/products/prod-vitamix-a3500-blender.jpg',
  'prod-nespresso-vertuo-next': '/products/prod-nespresso-vertuo-next.jpg',
  'prod-levoit-core-400s-purifier': '/products/prod-levoit-core-400s-purifier.jpg',
  'prod-ecobee-smart-thermostat': '/products/prod-ecobee-smart-thermostat.jpg',

  // Books (8)
  'prod-psychology-of-money': '/products/prod-psychology-of-money.jpg',
  'prod-atomic-habits': '/products/prod-atomic-habits.jpg',
  'prod-deep-work-cal-newport': '/products/prod-deep-work-cal-newport.jpg',
  'prod-clean-code-robert-martin': '/products/prod-clean-code-robert-martin.jpg',
  'prod-zero-to-one-peter-thiel': '/products/prod-zero-to-one-peter-thiel.jpg',
  'prod-designing-data-intensive-apps': '/products/prod-designing-data-intensive-apps.jpg',
  'prod-pragmatic-programmer-20th': '/products/prod-pragmatic-programmer-20th.jpg',
  'prod-thinking-fast-and-slow': '/products/prod-thinking-fast-and-slow.jpg',

  // Sports (10)
  'prod-manduka-pro-yoga-mat': '/products/prod-manduka-pro-yoga-mat.jpg',
  'prod-bowflex-selecttech-552': '/products/prod-bowflex-selecttech-552.jpg',
  'prod-garmin-forerunner-265': '/products/prod-garmin-forerunner-265.jpg',
  'prod-theragun-pro-massager': '/products/prod-theragun-pro-massager.jpg',
  'prod-wilson-pro-staff-racket': '/products/prod-wilson-pro-staff-racket.jpg',
  'prod-hydroflask-40oz-tumbler': '/products/prod-hydroflask-40oz-tumbler.jpg',
  'prod-yonex-astrox-99-badminton': '/products/prod-yonex-astrox-99-badminton.jpg',
  'prod-spalding-tf1000-basketball': '/products/prod-spalding-tf1000-basketball.jpg',
  'prod-trx-all-in-one-suspension': '/products/prod-trx-all-in-one-suspension.jpg',
  'prod-nike-brasilia-gym-duffel': '/products/prod-nike-brasilia-gym-duffel.jpg',

  // Beauty (8)
  'prod-fenty-pro-filtr-foundation': '/products/prod-fenty-pro-filtr-foundation.jpg',
  'prod-dyson-airwrap-multi-styler': '/products/prod-dyson-airwrap-multi-styler.jpg',
  'prod-dior-sauvage-elixir': '/products/prod-dior-sauvage-elixir.jpg',
  'prod-la-roche-posay-vitamin-c': '/products/prod-la-roche-posay-vitamin-c.jpg',
  'prod-chanel-coco-mademoiselle': '/products/prod-chanel-coco-mademoiselle.jpg',
  'prod-cerave-hydrating-cleanser': '/products/prod-cerave-hydrating-cleanser.jpg',
  'prod-ordinary-niacinamide-10': '/products/prod-ordinary-niacinamide-10.jpg',
  'prod-philips-oneblade-pro-360': '/products/prod-philips-oneblade-pro-360.jpg'
};

function createProductImage(title, brand, category, iconType, _bgStart, _bgEnd, _accent, productId) {
  if (productId && REAL_PRODUCT_IMAGES_BY_ID[productId]) {
    return REAL_PRODUCT_IMAGES_BY_ID[productId];
  }
  return productId ? `/products/${productId}.jpg` : '/products/prod-iphone-16-pro-max.jpg';
}

module.exports = { createProductImage, REAL_PRODUCT_IMAGES_BY_ID };
