
import { useState } from 'react';
import '../styles/globals.css';

export default function Home() {
  const [form, setForm] = useState({
    customer: '',
    rooms: [],
    services: {},
    price: '',
    description: ''
  });

  const roomOptions = ['Kitchen', 'Bathroom', 'Laundry', 'Basement'];
  const serviceOptions = {
    Kitchen: ['Backsplash Installation'],
    Bathroom: ['Wall Durock Installation', 'Floor Durock Installation', 'Pour and Level Floor', 'Pour and Pitch Shower Pan', 'Wall Tile Installation', 'Floor Tile Installation', 'Niche Installation', 'Stone Pieces Installation', 'Waterproof', 'Rubber Pan Installation'],
    Laundry: ['Durock Installation', 'Floor Installation'],
    Basement: ['Preparation', 'Installation']
  };

  const handleGenerate = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.customer}-workorder.pdf`;
    a.click();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Work Order Generator</h1>
      <input type="text" placeholder="Customer / Project" className="border p-2 w-full mb-3"
        value={form.customer}
        onChange={e => setForm({ ...form, customer: e.target.value })}
      />
      <label className="block mb-2 font-semibold">Select Rooms:</label>
      {roomOptions.map(room => (
        <div key={room}>
          <label className="font-medium">
            <input type="checkbox"
              checked={form.rooms.includes(room)}
              onChange={e => {
                const rooms = e.target.checked
                  ? [...form.rooms, room]
                  : form.rooms.filter(r => r !== room);
                setForm({ ...form, rooms });
              }}
            /> {room}
          </label>
          {form.rooms.includes(room) && (
            <div className="ml-4">
              {serviceOptions[room].map(service => (
                <div key={service}>
                  <label>
                    <input type="checkbox"
                      checked={form.services[room]?.includes(service)}
                      onChange={e => {
                        const roomServices = form.services[room] || [];
                        const newServices = e.target.checked
                          ? [...roomServices, service]
                          : roomServices.filter(s => s !== service);
                        setForm({
                          ...form,
                          services: { ...form.services, [room]: newServices }
                        });
                      }}
                    /> {service}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <input type="number" placeholder="Total Price" className="border p-2 w-full my-3"
        value={form.price}
        onChange={e => setForm({ ...form, price: e.target.value })}
      />
      <textarea placeholder="Description" className="border p-2 w-full mb-4" rows="4"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" onClick={handleGenerate}>
        Generate PDF
      </button>
    </div>
  );
}
