import {
   CdkPortalOutletAttachedRef, BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal
} from "@angular/cdk/portal";
import {
   Component, ViewChild, ComponentRef, EmbeddedViewRef
} from "@angular/core";

/**
 * Internal component that wraps user-provided popover content.
 */
@Component({
   selector: "app-popover",
   templateUrl: "./popover.component.html",
   styleUrls: ["./popover.component.scss"]
})
export class PopoverComponent extends BasePortalOutlet {
   @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet: CdkPortalOutlet;

   attachComponentPortal<T>(
      componentPortal: ComponentPortal<any>
   ): ComponentRef<T> {
      return this.portalOutlet.attachComponentPortal(componentPortal);
   }

   attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
      return this.portalOutlet.attachTemplatePortal(portal);
   }

   handleAttached(event: CdkPortalOutletAttachedRef) {
      let node = event["_viewContainerRef"];
      if (node && node.element && node.element.nativeElement && node.element.nativeElement.parentNode) {
         node = node.element.nativeElement;
         while (node.parentNode) {
            node = node.parentNode;
            if (node.classList) {
               if (node.classList.contains("cdk-overlay-connected-position-bounding-box")) {
                  node.style.zIndex = "1003";
               }

               if (node.classList.contains("cdk-overlay-container")) {
                  node.style.zIndex = "1002";
               }
            }
         }
      }
   }
}
