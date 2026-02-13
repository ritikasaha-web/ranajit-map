"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import FeatureEdit from "../shared/featureEdit";
import AttributeEdit from "../shared/attributeEdit";

interface EditTwinProps {
  data?: any;
}

export default function EditTwin({ data }: EditTwinProps) {
  const features = data?.features || {};
  const attributes = data?.attributes || {};

  return (
    <section className="bg-sky-50/60 p-4 rounded-xl">
      <div className="w-full mx-auto">
        <Accordion type="single" collapsible>
          <AccordionItem
            value="item-1"
            className="border border-sky-200 rounded-xl bg-white/70 backdrop-blur"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="text-xl font-semibold text-slate-800">
                Edit Twin
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex w-full gap-4 p-4 rounded-lg border border-sky-200 bg-white/80">
                {/* Attribute first (as requested earlier) */}
                <AttributeEdit data={attributes} thingId={data?.thingId} />

                {/* Feature second */}
                <FeatureEdit data={features} thingId={data?.thingId} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
