import { useState } from "react";

const PRODUCTS = [
  { id: "tech",   name: "Technology Sponsorship", basePrice: 899.00 },
  { id: "flags",  name: "Flags",                  basePrice: 899.00 },
  { id: "hio",    name: "Hole In One Insurance",  basePrice: 199.00 },
  { id: "signs",  name: "Hole Signs",             basePrice: 25.00  },
];

function Label({ children, required }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "#666", marginBottom: 7, textTransform: "uppercase" }}>
      {children}{required && <span style={{ color: "#111", marginLeft: 2 }}>*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input type="text" value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 13px", fontSize: 13.5, border: "1px solid #e2e2e2", borderRadius: 6, background: "#fff", color: "#111", boxSizing: "border-box", outline: "none" }} />
  );
}

function PriceInput({ value, onChange, readOnly }) {
  return (
    <div style={{ display: "flex", border: "1px solid #e2e2e2", borderRadius: 6, overflow: "hidden", background: readOnly ? "#f9f9f9" : "#fff" }}>
      <span style={{ padding: "10px 11px", fontSize: 13.5, color: "#888", borderRight: "1px solid #e2e2e2", background: "#f5f5f5", fontWeight: 500 }}>$</span>
      <input type="number" value={value} min="0" step="0.01" readOnly={readOnly}
        onChange={e => onChange?.(parseFloat(e.target.value) || 0)}
        style={{ flex: 1, padding: "10px 12px", fontSize: 13.5, border: "none", background: "transparent", color: readOnly ? "#888" : "#111", outline: "none" }} />
    </div>
  );
}

function QuantityStepper({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e2e2", borderRadius: 6, background: "#fff", overflow: "hidden" }}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
        style={{ width: 44, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
      <span style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 500, color: "#111" }}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        style={{ width: 44, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            style={{ flex: 1, padding: "9px 12px", borderRadius: 6, border: `1px solid ${active ? "#111" : "#e2e2e2"}`, background: active ? "#111" : "#fff", color: active ? "#fff" : "#555", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.12s" }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, sublabel, checked, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", border: "1px solid #e2e2e2", borderRadius: 6, background: "#fff" }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#111" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{sublabel}</div>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: checked ? "#111" : "#ddd", position: "relative", transition: "background 0.15s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
      </button>
    </div>
  );
}

function InfoBadge({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", background: "#f5f5f5", borderRadius: 6, border: "1px solid #e8e8e8" }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6" stroke="#888" strokeWidth="1.2"/>
        <path d="M7 6v4M7 4.5v.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 12.5, color: "#666" }}>{children}</span>
    </div>
  );
}

function SectionDivider({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em", color: "#aaa", textTransform: "uppercase", margin: "16px 0 10px" }}>{children}</div>;
}

function PriceSummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#111", padding: "8px 13px", background: "#f5f5f5", borderRadius: 6, marginTop: 8 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function TechOptions() {
  return (
    <>
      <SectionDivider>Includes</SectionDivider>
      <InfoBadge>Invoicing &amp; Discounts — included at no extra charge</InfoBadge>
    </>
  );
}

function FlagsOptions({ multiLogo, rush, onMultiLogo, onRush }) {
  const surcharge = (multiLogo || rush) ? 299 : 0;
  const total = 899 + surcharge;
  return (
    <>
      <SectionDivider>Add-ons</SectionDivider>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Toggle label="Multiple Logos" sublabel="+$299" checked={multiLogo} onChange={onMultiLogo} />
        <Toggle label="Rush Order" sublabel="+$299" checked={rush} onChange={onRush} />
      </div>
      {surcharge > 0 && (
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", padding: "7px 13px", background: "#fafafa", borderRadius: 6, border: "1px solid #eee" }}>
          <span>Add-on surcharge (one-time)</span>
          <span style={{ fontWeight: 600, color: "#555" }}>+$299</span>
        </div>
      )}
      <PriceSummaryRow label="Price per unit" value={`$${total.toFixed(2)}`} />
    </>
  );
}

function HIOOptions({ holeCount, onHoleCount }) {
  const price = holeCount === 1 ? 199 : 899;
  return (
    <>
      <SectionDivider>Coverage</SectionDivider>
      <RadioGroup
        value={holeCount}
        onChange={onHoleCount}
        options={[
          { value: 1, label: "1 Hole — $199" },
          { value: 4, label: "4 Holes — $899" },
        ]}
      />
      <PriceSummaryRow label="Price" value={`$${price.toFixed(2)}`} />
    </>
  );
}

function ProductSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", background: "#fff", border: "1px solid #e2e2e2", borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
        <div>
          {selected
            ? <><div style={{ fontWeight: 500, fontSize: 14, color: "#111" }}>{selected.name}</div><div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>${selected.basePrice.toFixed(2)}</div></>
            : <span style={{ fontSize: 14, color: "#aaa" }}>Select a product</span>}
        </div>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M3.5 5.5l4 4 4-4" stroke="#888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e2e2", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.09)", zIndex: 20, overflow: "hidden" }}>
          {options.map(opt => (
            <button key={opt.id} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 13px", background: opt.id === value ? "#f5f5f5" : "#fff", border: "none", borderBottom: "1px solid #f0f0f0", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 13.5, color: "#111", fontWeight: opt.id === value ? 500 : 400 }}>{opt.name}</span>
              <span style={{ fontSize: 12, color: "#888" }}>${opt.basePrice.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemsList({ items, onRemoveGroup }) {
  const groups = items.reduce((acc, item) => {
    if (!acc[item.groupId]) acc[item.groupId] = [];
    acc[item.groupId].push(item);
    return acc;
  }, {});

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div style={{ marginTop: 32, borderTop: "1px solid #e8e8e8", paddingTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "#666", textTransform: "uppercase", marginBottom: 12 }}>Added Items</div>
      {Object.entries(groups).map(([groupId, groupItems]) => {
        const parent = groupItems.find(i => !i.autoAdded);
        const children = groupItems.filter(i => i.autoAdded);
        return (
          <div key={groupId} style={{ marginBottom: 4, border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 14px", background: "#fff" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{parent.name}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  Qty {parent.quantity}{parent.notes?.length ? ` · ${parent.notes.join(", ")}` : ""}
                  {parent.priceOverridden && <span style={{ marginLeft: 6, padding: "1px 6px", background: "#fff3cd", color: "#856404", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>price overridden</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>${(parent.price * parent.quantity).toFixed(2)}</span>
                <button type="button" onClick={() => onRemoveGroup(groupId)}
                  style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid #e2e2e2", borderRadius: 6, cursor: "pointer", color: "#888" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            {children.map(child => (
              <div key={child.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px 8px 28px", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2v5h6" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12.5, color: "#666" }}>{child.name}</span>
                  <span style={{ fontSize: 11, padding: "1px 6px", background: "#f0f0f0", color: "#888", borderRadius: 4, fontWeight: 500 }}>auto-added</span>
                </div>
                <span style={{ fontSize: 12.5, color: "#888" }}>{child.price === 0 ? "Included" : `$${child.price.toFixed(2)}`}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 600, fontSize: 14, color: "#111" }}>
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function InvoiceProducts() {
  const [selectedId, setSelectedId] = useState(null);
  const [productName, setProductName] = useState("");
  const [priceOverride, setPriceOverride] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [holeCount, setHoleCount] = useState(1);
  const [multiLogo, setMultiLogo] = useState(false);
  const [rush, setRush] = useState(false);

  const computedPrice = (() => {
    if (selectedId === "hio")   return holeCount === 1 ? 199 : 899;
    if (selectedId === "flags") return 899 + ((multiLogo || rush) ? 299 : 0);
    return PRODUCTS.find(p => p.id === selectedId)?.basePrice ?? 0;
  })();

  const effectivePrice = priceOverride !== null ? priceOverride : computedPrice;

  const handleSelect = (opt) => {
    setSelectedId(opt.id);
    setProductName(opt.name);
    setQuantity(1);
    setPriceOverride(null);
    setHoleCount(1);
    setMultiLogo(false);
    setRush(false);
  };

  const handleHoleCount = (v) => { setHoleCount(v); setPriceOverride(null); };
  const handleMultiLogo = (v) => { setMultiLogo(v); setPriceOverride(null); };
  const handleRush = (v) => { setRush(v); setPriceOverride(null); };

  const handleAdd = () => {
    if (!selectedId) return;
    const groupId = `group-${Date.now()}`;
    const notes = [];
    if (selectedId === "hio")                notes.push(`${holeCount} hole${holeCount > 1 ? "s" : ""}`);
    if (selectedId === "flags" && multiLogo) notes.push("Multiple Logos");
    if (selectedId === "flags" && rush)      notes.push("Rush Order");

    const newItems = [
      {
        id: `${groupId}-main`,
        groupId,
        autoAdded: false,
        name: productName,
        price: effectivePrice,
        quantity,
        notes,
        priceOverridden: priceOverride !== null,
      },
    ];

    if (selectedId === "tech") {
      newItems.push({
        id: `${groupId}-inv`,
        groupId,
        autoAdded: true,
        name: "Invoicing & Discounts",
        price: 0,
        quantity: 1,
        notes: [],
      });
    }

    setItems(prev => [...prev, ...newItems]);
    setSelectedId(null); setProductName(""); setQuantity(1);
    setPriceOverride(null);
    setHoleCount(1); setMultiLogo(false); setRush(false);
  };

  const handleRemoveGroup = (groupId) => {
    setItems(prev => prev.filter(i => i.groupId !== groupId));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 520, margin: "0 auto", padding: "32px 16px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111", margin: "0 0 24px" }}>Invoice Products</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <Label required>Product</Label>
          <ProductSelect value={selectedId} onChange={handleSelect} options={PRODUCTS} />
        </div>
        {selectedId === "tech"  && <TechOptions />}
        {selectedId === "flags" && <FlagsOptions multiLogo={multiLogo} rush={rush} onMultiLogo={handleMultiLogo} onRush={handleRush} />}
        {selectedId === "hio"   && <HIOOptions holeCount={holeCount} onHoleCount={handleHoleCount} />}
        {selectedId && (
          <>
            <SectionDivider>Customize</SectionDivider>
            <div>
              <Label required>Product Name</Label>
              <TextInput value={productName} onChange={setProductName} placeholder="Product Name" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <Label required>Price</Label>
                {priceOverride !== null && (
                  <button type="button" onClick={() => setPriceOverride(null)}
                    style={{ fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                    Reset to ${computedPrice.toFixed(2)}
                  </button>
                )}
              </div>
              <PriceInput value={effectivePrice} onChange={setPriceOverride} />
              {priceOverride !== null && (
                <div style={{ fontSize: 11.5, color: "#856404", marginTop: 5 }}>
                  Overriding default price of ${computedPrice.toFixed(2)}
                </div>
              )}
            </div>
            <div>
              <Label required>Quantity</Label>
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </div>
          </>
        )}
        <button type="button" onClick={handleAdd} disabled={!selectedId}
          style={{ padding: "12px 20px", background: selectedId ? "#111" : "#e0e0e0", color: selectedId ? "#fff" : "#aaa", border: "none", borderRadius: 6, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", cursor: selectedId ? "pointer" : "not-allowed", transition: "background 0.15s" }}>
          Add to Invoice
        </button>
      </div>
      {items.filter(i => !i.autoAdded).length > 0 && (
        <ItemsList items={items} onRemoveGroup={handleRemoveGroup} />
      )}
    </div>
  );
}
