import {
   ComponentType,
   Overlay,
   ConnectionPositionPair
} from "@angular/cdk/overlay";
import {
   ComponentPortal,
   PortalInjector,
   TemplatePortal
} from "@angular/cdk/portal";
import {
   Injectable,
   InjectionToken,
   Injector,
   TemplateRef,
   ElementRef
} from "@angular/core";

import { PopoverConfig } from "./popover-config";
import { PopoverRef } from "./popover-ref";
import { PopoverComponent } from "./popover/popover.component";

/**
 * Injection token that can be used to access the data that was passed in to a popover.
 * */
export const POPOVER_DATA = new InjectionToken("popover.data");

const defaultConfig: PopoverConfig = {
   backdropClass: "",
   disableClose: false,
   panelClass: "",
   arrowOffset: 30,
   arrowSize: 20
};

export interface ExtendedConnectionPositionPair extends ConnectionPositionPair {
   id: string;
   selected?: boolean;
};

/**
 * Service to open modal and manage popovers.
 */
@Injectable({
   providedIn: "root"
})
export class PopoverService {
   public componentToAttach: TemplatePortal | ComponentPortal<any>;

   constructor(private overlay: Overlay, private injector: Injector) {}

   open<D = any>(
      componentOrTemplate: ComponentType<any> | TemplateRef<any>,
      target: ElementRef | HTMLElement,
      config: Partial<PopoverConfig> = {},
      preferredPositions?: Array<string>
   ): PopoverRef<D> {
      const popoverConfig: PopoverConfig = Object.assign(
         {},
         defaultConfig,
         config
      );

      const arrowSize = popoverConfig.arrowSize;
      const arrowOffset = popoverConfig.arrowOffset;
      const panelOffset = arrowSize / 2;

      // preferred positions, in order of priority
      const positions: ExtendedConnectionPositionPair[] = [
         // bottom center
         {
            id: "bottom center",
            overlayX: "center",
            overlayY: "top",
            originX: "center",
            originY: "bottom",
            panelClass: ["top", "center"],
            offsetY: panelOffset
         },
         // top center
         {
            id: "top center",
            overlayX: "center",
            overlayY: "bottom",
            originX: "center",
            originY: "top",
            panelClass: ["bottom", "center"],
            offsetY: -1 * panelOffset
         },
         // top left
         {
            id: "top left",
            overlayX: "start",
            overlayY: "bottom",
            originX: "center",
            originY: "top",
            panelClass: ["bottom", "left"],
            offsetX: -1 * arrowOffset,
            offsetY: -1 * panelOffset
         },
         // top right
         {
            id: "top right",
            overlayX: "end",
            overlayY: "bottom",
            originX: "center",
            originY: "top",
            panelClass: ["bottom", "right"],
            offsetX: arrowOffset,
            offsetY: -1 * panelOffset
         },
         // bottom left
         {
            id: "bottom left",
            overlayX: "start",
            overlayY: "top",
            originX: "center",
            originY: "bottom",
            panelClass: ["top", "left"],
            offsetX: -1 * arrowOffset,
            offsetY: panelOffset
         },
         // bottom right
         {
            id: "bottom right",
            overlayX: "end",
            overlayY: "top",
            originX: "center",
            originY: "bottom",
            panelClass: ["top", "right"],
            offsetX: arrowOffset,
            offsetY: panelOffset
         },
         // center center
         {
            id: "center center",
            overlayX: "center",
            overlayY: "center",
            originX: "center",
            originY: "center",
            panelClass: ["center", "center"],
            offsetY: panelOffset
         }
      ];

      let customPositions = [];
      if (preferredPositions && preferredPositions.length > 0) {
         preferredPositions.forEach(pref => {
            positions.forEach(p => {
               if (p.id === pref) {
                  customPositions.push(p);
                  p.selected = true;
               }
            });
         });
         positions.forEach(p => {
            if (!p.selected) {
               customPositions.push(p);
            }
         });
      } else {
         customPositions = positions;
      }

      console.log(customPositions);

      const positionStrategy = this.overlay
         .position()
         .flexibleConnectedTo(target)
         .withPush(false)
         .withFlexibleDimensions(false)
         .withPositions(customPositions);

      const overlayRef = this.overlay.create({
         hasBackdrop: true,
         backdropClass: config.backdropClass,
         panelClass: config.panelClass,
         positionStrategy,
         scrollStrategy: this.overlay.scrollStrategies.reposition()
      });

      const popoverRef = new PopoverRef(
         overlayRef,
         positionStrategy,
         popoverConfig
      );

      let popover = overlayRef.attach(
         new ComponentPortal(
            PopoverComponent,
            null,
            new PortalInjector(
               this.injector,
               new WeakMap<any, any>([[PopoverRef, popoverRef]])
            )
         )
      ).instance;

      if (popover && componentOrTemplate) {
         if (componentOrTemplate instanceof TemplateRef) {
            // rendering a provided template dynamically
            popover.attachTemplatePortal(
               new TemplatePortal(componentOrTemplate, null, {
                  $implicit: config.data,
                  popover: popoverRef
               })
            );
         } else {
            // rendering a provided component dynamically
            popover.attachComponentPortal(
               new ComponentPortal(
                  componentOrTemplate,
                  null,
                  new PortalInjector(
                     this.injector,
                     new WeakMap<any, any>([
                        [POPOVER_DATA, config.data],
                        [PopoverRef, popoverRef]
                     ])
                  )
               )
            );
         }
      }

      return popoverRef;
   }
}
