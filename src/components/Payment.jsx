import SectionHeader from './SectionHeader.jsx';

const paymentMethods = [
  { label: 'Bank wire', detail: 'USD, GBP, EUR', status: 'Available' },
  { label: 'Card deposit', detail: 'Visa, Mastercard', status: 'Instant' },
  { label: 'Crypto deposit', detail: 'BTC, ETH, USDT', status: 'Live' },
];

function Payment() {
  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Payment desk"
        title="Funds"
      />

      <div className="payment-layout">
        <article className="panel payment-card">
          <span>Available balance</span>
          <strong>$0</strong>
          <p>Ready for deposits, withdrawals, vault funding, and launchpad reservations.</p>
          <div className="payment-actions">
            <button className="primary-button" type="button">Deposit</button>
            <button className="secondary-button" type="button">Withdraw</button>
          </div>
        </article>

        <article className="panel">
          <SectionHeader
            eyebrow="Transfer"
            title="Move funds"
          />
          <label>
            Amount
            <input type="number" placeholder="0.00" />
          </label>
          <label>
            Destination
            <select>
              <option>Trading wallet</option>
              <option>Fixed deposit vault</option>
              <option>Stakepool</option>
              <option>Launchpad reserve</option>
            </select>
          </label>
          <button className="primary-button full-width" type="button">Continue</button>
        </article>

        <article className="panel">
          <SectionHeader
            eyebrow="Methods"
            title="Payment rails"
          />
          <div className="method-list">
            {paymentMethods.map((method) => (
              <div className="method-item" key={method.label}>
                <div>
                  <strong>{method.label}</strong>
                  <span>{method.detail}</span>
                </div>
                <small>{method.status}</small>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default Payment;
