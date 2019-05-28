import 'vtk.js/Sources/favicon.js';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkSphereMapper from 'vtk.js/Sources/Rendering/Core/SphereMapper';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkPixelSpaceCallbackMapper from 'vtk.js/Sources/Rendering/Core/PixelSpaceCallbackMapper';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInterActor from 'vtk.js/Sources/Rendering/Core/RenderWindowInterActor';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkInterActorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InterActorStyleTrackballCamera';

import style from './style.module.css';

// ----------------------------------------------------------------------------
// Standard rendering code setup 标准渲染代码设置
// ----------------------------------------------------------------------------

let textCtx = null;
let dims = null;

const renderWindow = vtkRenderWindow.newInstance();
const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
renderWindow.addRenderer(renderer);

// ----------------------------------------------------------------------------
// Simple pipeline ConeSource --> Mapper --> Actor
// ----------------------------------------------------------------------------

const coneSource = vtkConeSource.newInstance({ height: 1.0 });

const mapper = vtkSphereMapper.newInstance();
mapper.setInputConnection(coneSource.getOutputPort());

const actor = vtkActor.newInstance();
actor.setMapper(mapper);

const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
psMapper.setInputConnection(coneSource.getOutputPort());
psMapper.setCallback((coordsList) => {
  if (textCtx && dims) {
    textCtx.clearRect(0, 0, dims.width, dims.height);
    coordsList.forEach((xy, idx) => {
      textCtx.font = '12px serif';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      textCtx.fillText(`p ${idx}`, xy[0], dims.height - xy[1]);
    });
  }
});

const textActor = vtkActor.newInstance();
textActor.setMapper(psMapper);

// ----------------------------------------------------------------------------
// Add the actor to the renderer and set the camera based on it 将actor添加到渲染器并根据它设置camera
// ----------------------------------------------------------------------------

renderer.addActor(actor);
renderer.addActor(textActor);
renderer.resetCamera();

// ----------------------------------------------------------------------------
// Use OpenGL as the backend to view the all this 使用OpenGL作为后端来查看所有这些
// ----------------------------------------------------------------------------

const OpenGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
renderWindow.addView(OpenGLRenderWindow);

// ----------------------------------------------------------------------------
// Create a div section to put this into 创建一个div部分将其放入
// ----------------------------------------------------------------------------

const container = document.createElement('div');
container.classList.add(style.container);
document.querySelector('body').appendChild(container);
OpenGLRenderWindow.setContainer(container);

const textCanvas = document.createElement('canvas');
textCanvas.classList.add(style.container, 'textCanvas');
container.appendChild(textCanvas);

textCtx = textCanvas.getContext('2d');

// ----------------------------------------------------------------------------
// Setup an InterActor to handle mouse events 设置一个交互器来处理鼠标事件
// ----------------------------------------------------------------------------

var InterActor = vtkRenderWindowInterActor.newInstance();
InterActor.setView(OpenGLRenderWindow);
InterActor.initialize();
InterActor.bindEvents(container);

InterActor.setInterActorStyle(vtkInterActorStyleTrackballCamera.newInstance());

// Handle window resize 处理窗口调整大小
function resize() {
  dims = container.getBoundingClientRect();
  OpenGLRenderWindow.setSize(dims.width, dims.height);
  textCanvas.setAttribute('width', dims.width);
  textCanvas.setAttribute('height', dims.height);
  renderWindow.render();
}

window.addEventListener('resize', resize);

resize();
