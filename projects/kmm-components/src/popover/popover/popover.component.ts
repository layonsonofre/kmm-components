import {
   CdkPortalOutletAttachedRef
} from "@angular/cdk/portal";
import {
   Component
} from "@angular/core";
import { PopoverService } from "../popover.service";

/**
 * Internal component that wraps user-provided popover content.
 */
@Component({
   selector: "app-popover",
   templateUrl: "./popover.component.html",
   styleUrls: ["./popover.component.scss"]
})
export class PopoverComponent {

   constructor(public popoverService: PopoverService) {}

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
