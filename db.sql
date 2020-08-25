USE [ssalud]
GO

/****** Object:  Table [dbo].[wa_dispositivos]    Script Date: 24/08/2020 23:37:37 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[wa_dispositivos](
	[token] [varchar](50) NOT NULL,
	[numero] [varchar](13) NULL,
 CONSTRAINT [PK_wa_dispositivos] PRIMARY KEY CLUSTERED 
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

USE [ssalud]
GO

/****** Object:  Table [dbo].[wa_mensage]    Script Date: 24/08/2020 23:37:47 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[wa_mensage](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[mensaje] [varchar](max) NULL,
	[origen] [varchar](20) NULL,
	[ACK] [varchar](4) NULL,
	[media] [varchar](max) NULL,
	[mime] [varchar](50) NULL,
	[ID2] [varchar](40) NULL,
	[tipo] [varchar](20) NULL,
	[fecha] [datetime] NULL,
	[chat] [varchar](50) NULL,
	[dispo_numero] [varchar](13) NULL,
 CONSTRAINT [PK_wa_mensage] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


USE [ssalud]
GO
/****** Object:  StoredProcedure [dbo].[wa_mensaje_nuevo]    Script Date: 24/08/2020 16:12:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
alter PROCEDURE [dbo].[wa_mensaje_nuevo] 
@MENSAJE as VARCHAR(MAX),
@ESTADO AS VARCHAR(4),
@ORIGEN AS VARCHAR(20),
@ID2 AS VARCHAR(40),
@tipo AS VARCHAR(40),
@chat AS VARCHAR(50),
@fecha AS BIGINT,
/*varchar(19),
*/
@dispositivo AS varchar(13)
AS
BEGIN

declare @dfecha as datetime
set @dfecha = dateadd(S, @fecha, DATETIMEOFFSETFROMPARTS ( 1969,12,31, 21,0, 0,0,0,0,0))
/*'1969-31-12 21:00:00')
CONVERT(Datetime, @fecha)
*/
if @chat='status'
	set @chat=@ORIGEN


INSERT INTO [dbo].[wa_mensage] (MENSAJE,ORIGEN, ACK,ID2, tipo,fecha, chat, dispo_numero) VALUES (@MENSAJE, @ORIGEN, @ESTADO, @ID2, @tipo,@dfecha,@chat, @dispositivo)

end
go

USE [ssalud]
GO

/****** Object:  StoredProcedure [dbo].[wa_alta_dispo]    Script Date: 24/08/2020 23:38:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO

ALTER PROCEDURE [dbo].[wa_alta_dispo] 
	@token as varchar(50) ,
	@numero as varchar(13)
AS
BEGIN

delete wa_dispositivos where token=@token
delete wa_dispositivos where numero=@numero
insert into wa_dispositivos (token, numero) values( @token, @numero)

end
GO

USE [ssalud]
GO

/****** Object:  StoredProcedure [dbo].[wa_mensaje_media]    Script Date: 24/08/2020 23:39:31 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO

ALTER PROCEDURE [dbo].[wa_mensaje_media] 
@id2 as VARCHAR(40),
@MEDIA AS VARchar(MAX),
@mime as varchar(50),
@dispositivo as varchar(13)
AS
BEGIN

UPDATE [dbo].[wa_mensage] SET MEDIA=  @MEDIA, MIME = @mime WHERE ID2= @ID2 and dispo_numero=@dispositivo

end
GO
