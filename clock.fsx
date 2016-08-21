#r "node_modules/fable-core/Fable.Core.dll"

open System
open Fable.Core
open Fable.Import

let BackgroundColor = U3.Case1 "#181818"
let DialColor = U3.Case1 "linen"

let LogicalWidth = 1000.
let LogicalHeight = 1000.
let DialLineWidth = 50.
let InnerDialRadius = 1000. - DialLineWidth / 2.   // so the edge of circle is aligned with browse edge.

let getWindowSize() = double(Browser.window.innerWidth), double(Browser.window.innerHeight)

module Canvas =
  type Graphics = Browser.CanvasRenderingContext2D

  let fill rect color (g: Graphics) =
    g.fillStyle <- color
    g.fillRect rect
    g

  let private arc0 (start, end') radius (g: Graphics) =
    g.arc(0., 0., radius, start, end', false)
    g

  let private circle0 : float -> Graphics -> Graphics = arc0 (0., Math.PI*2.)

  let drawCircle radius drawOp (g: Graphics) =
    g.beginPath()
    circle0 radius g |> ignore
    g.closePath()
    drawOp g
    g

  let stroke color (g: Graphics) =
    g.strokeStyle <- color
    g.stroke()
    g


module Clock =
  type ClockInfo =
    { Size: float * float
      Center: float * float
      FitSize: float
      g: Browser.CanvasRenderingContext2D  }
  with
    member c.Width = fst <| c.Size
    member c.Height = snd <| c.Size

    static member enterLogicalFrame c =
      c.g.translate c.Center
      c.g.scale(c.FitSize/LogicalWidth, c.FitSize/LogicalHeight)
      c

    static member drawDial c =
      c.g.lineWidth <- DialLineWidth
      c.g |> Canvas.drawCircle InnerDialRadius (Canvas.stroke DialColor >> ignore)

  let safeState f clock =
    clock.g.save()
    let x = f clock
    clock.g.restore()
    x

  let clearClock color clock =
    clock.g |> Canvas.fill (0., 0., clock.Width, clock.Height) color
            |> ignore 
    clock

  let setCanvasSize (w, h) (canvas: Browser.HTMLCanvasElement) =
    canvas.width <- w
    canvas.height <- h
    canvas

  let getCanvas() = Browser.document.getElementsByTagName_canvas().[0]

  let createClock ((w,h) as size) (canvas: Browser.HTMLCanvasElement) =
     canvas |> setCanvasSize size |> ignore
     let cx = w / 2.
     let cy = h / 2.
     { Size=size
       Center = cx, cy
       FitSize = Math.Min(cx, cy)
       g = canvas.getContext_2d() }

  let renderTime dt clock =
    clock |> clearClock BackgroundColor
          |> ClockInfo.enterLogicalFrame 
          |> ClockInfo.drawDial

  let render = safeState (renderTime DateTime.Now)


let size = getWindowSize()
let clock = Clock.getCanvas() |> Clock.createClock size
let render() = Clock.render clock
Browser.window.setTimeout(render, 1000) |> ignore
