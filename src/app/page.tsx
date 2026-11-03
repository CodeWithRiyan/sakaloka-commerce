import Image from 'next/image';

// The three ways to order, built in R3. The images are placeholders drawn for this repo;
// the client's banners are loaded only after written permission (T-PR-06).
const orderTypes = [
  {
    image: '/placeholder/order-uniform.svg',
    title: 'Uniform order',
    text: 'One product for the whole team, with a name, number and size per player.',
  },
  {
    image: '/placeholder/order-mix.svg',
    title: 'Mix order',
    text: 'Several products in one order, one row per product.',
  },
  {
    image: '/placeholder/order-stock.svg',
    title: 'Stock order',
    text: 'Ready-made items by size, straight from stock.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-body-tertiary border-bottom py-5">
        <div className="container py-lg-4">
          <h1 className="display-5 fw-bold">Custom sports uniforms for your team</h1>
          <p className="lead col-lg-8">
            Pick a product, choose the fabric and options, and add your players. The new i2i site is
            being rebuilt; ordering opens in a later release.
          </p>
          <a className="btn btn-primary btn-lg" href="#order-types">
            See how to order
          </a>
        </div>
      </section>

      <section id="order-types" className="container py-5">
        <h2 className="h3 mb-4">Three ways to order</h2>
        <div className="row g-4">
          {orderTypes.map((type) => (
            <div key={type.title} className="col-md-4">
              <div className="card h-100 order-type-card">
                <Image src={type.image} alt="" width={731} height={452} className="card-img-top" />
                <div className="card-body">
                  <h3 className="h5 card-title">{type.title}</h3>
                  <p className="card-text">{type.text}</p>
                  <span className="badge text-bg-secondary">Coming soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
