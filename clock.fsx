#r "node_modules/fable-core/Fable.Core.dll"

open Fable.Core
open Fable.Import

let logicalWidth = 1000
let logicalHeight = 1000

let getWindowSize() = double(Browser.window.innerWidth), double(Browser.window.innerHeight)

module Canvas =
  let fillStyle color (g: Browser.CanvasRenderingContext2D) =
    g.fillStyle <- U3.Case1 color
    g

  let private fill0 (g: Browser.CanvasRenderingContext2D) = g.fill(); g

  let fill color = fillStyle color >> fill0

let canvas = Browser.document.getElementsByTagName_canvas().[0]

let g = canvas.getContext_2d()

let ratio = double(logicalHeight) / double(logicalWidth)

let w,h = getWindowSize()

g.fillStyle <- U3.Case1 "yellow"
g.fillRect(0.,0., w,h)