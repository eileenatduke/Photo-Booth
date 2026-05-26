import { useSession } from "./state/session";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LayoutPicker } from "./components/LayoutPicker";
import { BackgroundPicker } from "./components/BackgroundPicker";
import { CameraView } from "./components/CameraView";
import { ReviewScreen } from "./components/ReviewScreen";
import { FilterPicker } from "./components/FilterPicker";
import { OutputScreen } from "./components/OutputScreen";

export default function App() {
  const step = useSession((s) => s.step);
  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-7xl min-h-screen flex flex-col">
        {step === "welcome" && <WelcomeScreen />}
        {step === "layout" && <LayoutPicker />}
        {step === "background" && <BackgroundPicker />}
        {(step === "camera" || step === "capturing") && <CameraView />}
        {step === "review" && <ReviewScreen />}
        {step === "filter" && <FilterPicker />}
        {step === "output" && <OutputScreen />}
      </div>
    </main>
  );
}
