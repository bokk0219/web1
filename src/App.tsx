import { useEffect, useState } from "react";
import type { AppData, Item, Record } from "./types";
import { loadData, saveData, makeId } from "./storage";
import Splash from "./components/Splash";
import Home from "./components/Home";
import ItemsList from "./components/ItemsList";
import ItemDetail from "./components/ItemDetail";
import BottomNav from "./components/BottomNav";
import AddItemModal from "./components/AddItemModal";
import AddRecordModal from "./components/AddRecordModal";

type Tab = "home" | "items";

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>("home");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [pendingRecordItemId, setPendingRecordItemId] = useState<string | undefined>(undefined);

  useEffect(() => {
    saveData(data);
  }, [data]);

  if (!data.hasVisited) {
    return (
      <Splash
        onStart={() => setData((d) => ({ ...d, hasVisited: true }))}
      />
    );
  }

  function createItem(input: Omit<Item, "id" | "createdAt">) {
    const item: Item = { ...input, id: makeId(), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, items: [...d.items, item] }));
    setShowAddItem(false);
    setShowAddRecord(true);
    setPendingRecordItemId(item.id);
  }

  function createRecord(input: Omit<Record, "id" | "createdAt">) {
    const record: Record = { ...input, id: makeId(), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, records: [...d.records, record] }));
    setShowAddRecord(false);
    setPendingRecordItemId(undefined);
  }

  function deleteRecord(recordId: string) {
    setData((d) => ({ ...d, records: d.records.filter((r) => r.id !== recordId) }));
  }

  function deleteItem(itemId: string) {
    setData((d) => ({
      ...d,
      items: d.items.filter((i) => i.id !== itemId),
      records: d.records.filter((r) => r.itemId !== itemId),
    }));
    setSelectedItemId(null);
    setTab("items");
  }

  const selectedItem = data.items.find((i) => i.id === selectedItemId) ?? null;

  return (
    <div className="max-w-md mx-auto relative">
      {selectedItem ? (
        <ItemDetail
          item={selectedItem}
          records={data.records.filter((r) => r.itemId === selectedItem.id)}
          onBack={() => setSelectedItemId(null)}
          onAddRecord={() => {
            setPendingRecordItemId(selectedItem.id);
            setShowAddRecord(true);
          }}
          onDeleteRecord={deleteRecord}
          onDeleteItem={() => deleteItem(selectedItem.id)}
        />
      ) : (
        <>
          {tab === "home" && (
            <Home
              items={data.items}
              records={data.records}
              onOpenItem={setSelectedItemId}
              onAddRecord={() => {
                setPendingRecordItemId(undefined);
                setShowAddRecord(true);
              }}
            />
          )}
          {tab === "items" && (
            <ItemsList
              items={data.items}
              records={data.records}
              onOpenItem={setSelectedItemId}
              onAddItem={() => setShowAddItem(true)}
            />
          )}
          <BottomNav active={tab} onChange={setTab} />
        </>
      )}

      {showAddItem && (
        <AddItemModal onClose={() => setShowAddItem(false)} onCreate={createItem} />
      )}

      {showAddRecord && (
        <AddRecordModal
          items={data.items}
          initialItemId={pendingRecordItemId}
          onClose={() => {
            setShowAddRecord(false);
            setPendingRecordItemId(undefined);
          }}
          onCreate={createRecord}
          onRequestNewItem={() => {
            setShowAddRecord(false);
            setShowAddItem(true);
          }}
        />
      )}
    </div>
  );
}
