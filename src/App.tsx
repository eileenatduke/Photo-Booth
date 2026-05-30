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
    <main className="min-h-screen bg-porcelain text-ink">
      <div className="mx-auto max-w-[1180px] min-h-screen flex flex-col px-5 sm:px-10 py-8">
        <div className="relative flex-1 flex flex-col">
          {step === "welcome" && <WelcomeScreen />}
          {step === "layout" && <LayoutPicker />}
          {step === "background" && <BackgroundPicker />}
          {(step === "camera" || step === "capturing") && <CameraView />}
          {step === "review" && <ReviewScreen />}
          {step === "filter" && <FilterPicker />}
          {step === "output" && <OutputScreen />}
        </div>
      </div>
    </main>
  );
}
