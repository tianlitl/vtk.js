import vtk

reader = vtk.vtkXMLImageDataReader()
reader.SetFileName("headsq.vti")
reader.Update()
image = reader.GetOutput()

writer = vtk.vtkJPEGWriter()
writer.SetInputData(image)
writer.SetFileName("test.jpg")
writer.Write()